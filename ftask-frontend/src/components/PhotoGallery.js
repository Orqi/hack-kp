import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './PhotoGallery.css';
import useLazyLoad from '../useLazyLoad';
import { motion, AnimatePresence } from 'framer-motion';
import { listAnnotations, createAnnotation, configureMock, deleteAnnotation } from '../api/mockAnnotationApi';
import image1 from './1.png';
import image2 from './2.png';
import image3 from './3.png';
import image4 from './4.png';
import image5 from './5.png';
import image6 from './6.png';

const PhotoGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(null);

    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    // Annotation state
    const [isAnnotating, setIsAnnotating] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [draftRect, setDraftRect] = useState(null);
    const [labelMode, setLabelMode] = useState(false);
    const [labelInput, setLabelInput] = useState('');
    const [annotations, setAnnotations] = useState([]);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const imgRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        configureMock({ failRate: 0.05 });
    }, []);

    useEffect(() => {
        const imageSources = [image1, image2, image3, image4, image5, image6];
        const data = imageSources.map((src, i) => ({
            id: i + 1,
            src,
            title: `Image ${i + 1}`
        }));
        setImages(data);
        setLoading(false);
    }, []);

    const resetViewState = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setIsDragging(false);
    };

    const openPreview = useCallback(async (img, index) => {
        setPreviewImage(img);
        setCurrentIndex(index);
        resetViewState();
        setAnnotations([]);
        setIsAnnotating(false);
        setDraftRect(null);
        setLabelMode(false);
        setLabelInput('');
        setError(null);
        try {
            const existing = await listAnnotations(img.id);
            setAnnotations(existing);
        } catch {
            setError('Failed to load annotations');
        }
    }, []);

    const closePreview = useCallback(() => {
        setPreviewImage(null);
        setCurrentIndex(null);
        resetViewState();
        setIsAnnotating(false);
        setDraftRect(null);
        setLabelMode(false);
        setLabelInput('');
        setError(null);
    }, []);

    const goToNext = useCallback((e) => {
        e.stopPropagation();
        if (currentIndex === null || images.length === 0) return;
        const nextIndex = (currentIndex + 1) % images.length;
        openPreview(images[nextIndex], nextIndex);
    }, [currentIndex, images, openPreview]);

    const goToPrev = useCallback((e) => {
        e.stopPropagation();
        if (currentIndex === null || images.length === 0) return;
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        openPreview(images[prevIndex], prevIndex);
    }, [currentIndex, images, openPreview]);

    const handleZoom = (direction) => {
        setZoom(prevZoom => {
            const newZoom = direction === 'in' ? prevZoom * 1.2 : prevZoom / 1.2;
            return Math.max(1, Math.min(newZoom, 10)); // Clamp zoom between 1x and 10x
        });
    };

    useEffect(() => {
        const onKey = (e) => {
            if (previewImage) {
                if (e.key === 'Escape') {
                    if (labelMode) {
                        setLabelMode(false);
                        setDraftRect(null);
                        setLabelInput('');
                    } else {
                        closePreview();
                    }
                } else if (e.key === 'ArrowRight' && zoom === 1) {
                    goToNext(e);
                } else if (e.key === 'ArrowLeft' && zoom === 1) {
                    goToPrev(e);
                } else if (e.key === '+') {
                    handleZoom('in');
                } else if (e.key === '-') {
                    handleZoom('out');
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [labelMode, closePreview, previewImage, goToNext, goToPrev, zoom]);

    const toggleAnnotate = () => {
        setIsAnnotating(a => !a);
        setIsDrawing(false);
        setDraftRect(null);
        setLabelMode(false);
        setLabelInput('');
        setError(null);
    };

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    const getImageMetrics = () => {
        const imgEl = imgRef.current;
        if (!imgEl) return null;
        const rect = imgEl.getBoundingClientRect();
        return {
            displayX: rect.left,
            displayY: rect.top,
            displayW: rect.width,
            displayH: rect.height,
            naturalW: imgEl.naturalWidth || rect.width,
            naturalH: imgEl.naturalHeight || rect.height
        };
    };

    const handleMouseDown = (e) => {
        if (isAnnotating && !labelMode) {
            const m = getImageMetrics();
            if (!m) return;
            const x = clamp(e.clientX - m.displayX, 0, m.displayW);
            const y = clamp(e.clientY - m.displayY, 0, m.displayH);
            setDraftRect({ x1: x, y1: y, x2: x, y2: y });
            setIsDrawing(true);
        } else if (zoom > 1) {
            setIsDragging(true);
            dragStartRef.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            };
            e.currentTarget.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e) => {
        if (isAnnotating && isDrawing && draftRect) {
            const m = getImageMetrics();
            if (!m) return;
            const x = clamp(e.clientX - m.displayX, 0, m.displayW);
            const y = clamp(e.clientY - m.displayY, 0, m.displayH);
            setDraftRect(prev => prev ? { ...prev, x2: x, y2: y } : prev);
        } else if (isDragging) {
            const newX = e.clientX - dragStartRef.current.x;
            const newY = e.clientY - dragStartRef.current.y;
            setPosition({ x: newX, y: newY });
        }
    };

    const handleMouseUp = (e) => {
        if (isAnnotating && isDrawing && draftRect) {
            setIsDrawing(false);
            if (Math.abs(draftRect.x2 - draftRect.x1) < 4 || Math.abs(draftRect.y2 - draftRect.y1) < 4) {
                setDraftRect(null);
                return;
            }
            setLabelMode(true);
            setLabelInput('');
        } else if (isDragging) {
            setIsDragging(false);
            e.currentTarget.style.cursor = zoom > 1 ? 'grab' : 'default';
        }
    };

    const handleMouseLeave = (e) => {
        if (isDragging) {
            setIsDragging(false);
            e.currentTarget.style.cursor = zoom > 1 ? 'grab' : 'default';
        }
    };

    const submitAnnotation = async () => {
        if (!draftRect || !labelInput.trim() || !previewImage) return;
        const m = getImageMetrics();
        if (!m) return;

        const left = Math.min(draftRect.x1, draftRect.x2);
        const top = Math.min(draftRect.y1, draftRect.y2);
        const width = Math.abs(draftRect.x2 - draftRect.x1);
        const height = Math.abs(draftRect.y2 - draftRect.y1);

        const scaleX = m.naturalW / m.displayW;
        const scaleY = m.naturalH / m.displayH;

        const naturalRect = {
            x: Math.round(left * scaleX),
            y: Math.round(top * scaleY),
            w: Math.round(width * scaleX),
            h: Math.round(height * scaleY)
        };

        const payload = {
            imageId: previewImage.id,
            label: labelInput.trim(),
            ...naturalRect
        };

        const tempId = 'temp-' + Date.now();
        setAnnotations(a => [...a, { id: tempId, ...payload }]);
        setDraftRect(null);
        setLabelMode(false);
        setLabelInput('');
        setSaving(true);
        setError(null);

        try {
            const saved = await createAnnotation(payload);
            setAnnotations(a => a.map(an => an.id === tempId ? saved : an));
        } catch (e) {
            setError(e.message || 'Save failed');
            setAnnotations(a => a.filter(an => an.id !== tempId));
        } finally {
            setSaving(false);
        }
    };

    const cancelLabel = () => {
        setDraftRect(null);
        setLabelMode(false);
        setLabelInput('');
    };

    const removeAnnotation = (id) => {
        setAnnotations(a => a.filter(x => x.id !== id));
        try { deleteAnnotation(id); } catch {}
    };

    const renderAnnotationBoxes = () => {
        const m = getImageMetrics();
        if (!m) return null;
        const scaleX = m.displayW / m.naturalW;
        const scaleY = m.displayH / m.naturalH;
        return annotations.map(a => {
            const left = a.x * scaleX;
            const top = a.y * scaleY;
            const w = a.w * scaleX;
            const h = a.h * scaleY;
            return (
                <div
                    key={a.id}
                    className="anno-box"
                    style={{ left, top, width: w, height: h }}
                >
                    <span className="anno-label">
                        {a.label}
                    </span>
                </div>
            );
        });
    };

    const renderDraftBox = () => {
        if (!draftRect) return null;
        const left = Math.min(draftRect.x1, draftRect.x2);
        const top = Math.min(draftRect.y1, draftRect.y2);
        const w = Math.abs(draftRect.x2 - draftRect.x1);
        const h = Math.abs(draftRect.y2 - draftRect.y1);
        return <div className="anno-draft" style={{ left, top, width: w, height: h }} />;
    };

    return (
        <>
            <motion.div
                className="photo-gallery"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
            >
                {loading ? (
                    <div className="placeholder">Loading images...</div>
                ) : (
                    <div className="thumbnail-grid">
                        {images.map((img, index) => (
                            <Thumbnail
                                key={img.id}
                                src={img.src}
                                title={img.title}
                                alt={img.title}
                                onOpen={() => openPreview(img, index)}
                            />
                        ))}
                    </div>
                )}
            </motion.div>

            {createPortal(
                <AnimatePresence>
                    {previewImage && (
                        <motion.div
                            className="preview-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {}
                            <div className="preview-header" onClick={closePreview}>
                                <div className="preview-title">{previewImage.title}</div>
                            </div>

                            <button
                                className="preview-close-x"
                                onClick={closePreview}
                                aria-label="Close preview"
                                title="Close (Esc)"
                            >&times;</button>

                            <button
                                className="preview-nav-button prev"
                                onClick={goToPrev}
                                aria-label="Previous image"
                            >
                                &#10094;
                            </button>

                            <button
                                className="preview-nav-button next"
                                onClick={goToNext}
                                aria-label="Next image"
                            >
                                &#10095;
                            </button>

                            <div className="preview-footer">
                                <div className="preview-toolbar left">
                                    <button
                                        className={`annotate-toggle ${isAnnotating ? 'on' : ''}`}
                                        onClick={toggleAnnotate}
                                        title="Toggle Annotation Mode"
                                    >
                                        {isAnnotating ? 'Annotate: ON' : 'Annotate: OFF'}
                                    </button>
                                </div>
                                <div className="preview-toolbar center">
                                    <button onClick={() => handleZoom('out')} title="Zoom Out (-)">-</button>
                                    <button onClick={resetViewState} title="Reset View">{(zoom * 100).toFixed(0)}%</button>
                                    <button onClick={() => handleZoom('in')} title="Zoom In (+)">+</button>
                                </div>
                                <div className="preview-toolbar right">
                                    {saving && <div className="anno-status saving">Saving...</div>}
                                    {error && <div className="anno-status error">{error}</div>}
                                </div>
                            </div>

                            {/* The image container is now the only thing that animates in the center */}
                            <div className="preview-content-wrapper" onClick={closePreview}>
                                <motion.div
                                    className="preview-container"
                                    onClick={e => e.stopPropagation()}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseLeave}
                                    style={{ cursor: isAnnotating ? 'crosshair' : (zoom > 1 ? 'grab' : 'default') }}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                                >
                                    <div
                                        className="image-transform-wrapper"
                                        style={{
                                            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                                            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                                        }}
                                    >
                                        <img
                                            ref={imgRef}
                                            src={previewImage.src}
                                            alt={previewImage.title}
                                            className="preview-image"
                                            draggable={false}
                                        />
                                        {renderAnnotationBoxes()}
                                        {renderDraftBox()}
                                    </div>

                                    {labelMode && draftRect && (
                                        <div className="label-popover">
                                            <input
                                                autoFocus
                                                value={labelInput}
                                                onChange={e => setLabelInput(e.target.value)}
                                                placeholder="Label"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') submitAnnotation();
                                                    if (e.key === 'Escape') cancelLabel();
                                                }}
                                            />
                                            <button
                                                onClick={submitAnnotation}
                                                disabled={!labelInput.trim() || saving}
                                            >
                                                Save
                                            </button>
                                            <button onClick={cancelLabel} disabled={saving}>Cancel</button>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

const Thumbnail = ({ src, title, alt, onOpen }) => {
    const imgRef = useRef(null);
    const visible = useLazyLoad(imgRef);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (visible && src) setLoaded(true);
    }, [visible, src]);

    return (
        <motion.div
            className="thumbnail-wrapper"
            onClick={onOpen}
            whileHover={{ scale: 1.05, y: -4 }}
            transition={{ duration: 0.18 }}
            style={{ width: '250px', height: '250px' }}
        >
            <img
                ref={imgRef}
                src={loaded ? src : null}
                alt={alt}
                className="thumbnail"
                style={{
                    filter: !loaded ? 'blur(6px)' : 'none',
                    transition: 'filter .5s ease',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
            <div className="thumbnail-caption">
                <span>{title}</span>
            </div>
        </motion.div>
    );
};

export default PhotoGallery;