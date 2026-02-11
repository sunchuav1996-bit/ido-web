// Browser-based image validation with face detection using tracking.js
import 'tracking';
import 'tracking/build/data/face-min.js';

// Access tracking from window (UMD global)
declare global {
    interface Window {
        tracking: any;
    }
}

export interface ImageValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates an image using Canvas API and face detection
 * Checks: dimensions, face presence
 */
export const validateImageContent = async (imageElement: HTMLImageElement): Promise<ImageValidationResult> => {
    const errors: string[] = [];

    try {
        const minWidth = 200;
        const minHeight = 200;
        const maxWidth = 8000;
        const maxHeight = 8000;

        // Check dimensions
        if (imageElement.width < minWidth || imageElement.height < minHeight) {
            errors.push(`Image too small. Minimum size is ${minWidth}x${minHeight}px`);
        }

        if (imageElement.width > maxWidth || imageElement.height > maxHeight) {
            errors.push(`Image too large. Maximum size is ${maxWidth}x${maxHeight}px`);
        }

        // Check if image is corrupted
        if (imageElement.naturalWidth === 0 || imageElement.naturalHeight === 0) {
            errors.push('Image appears to be corrupted or invalid');
        }

        // Stop early if basic checks fail
        if (errors.length > 0) {
            return { isValid: false, errors };
        }

        // Face detection using tracking.js
        const faces = await detectFaces(imageElement);

        if (faces.length === 0) {
            errors.push('No face detected in the photo. Please upload a clear photo with a visible face.');
        }

        const result = {
            isValid: errors.length === 0,
            errors
        };

        return result;
    } catch (error) {
        console.error('Image validation error:', error);
        return {
            isValid: false,
            errors: ['Failed to validate image']
        };
    }
};

/**
 * Detect faces in an image using tracking.js
 */
const detectFaces = (imageElement: HTMLImageElement): Promise<any[]> => {
    return new Promise((resolve) => {
        try {
            // Create canvas from image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve([]);
                return;
            }

            canvas.width = imageElement.width;
            canvas.height = imageElement.height;
            ctx.drawImage(imageElement, 0, 0);

            // Run face detection
            const tracker = new window.tracking.ObjectTracker('face');
            tracker.setInitialScale(4);
            tracker.setStepSize(2);
            tracker.setEdgesDensity(0.1);

            const detectedFaces: any[] = [];
            tracker.on('track', (event: any) => {
                if (event.data) {
                    detectedFaces.push(...event.data);
                }
                resolve(detectedFaces);
            });

            window.tracking.track(canvas, tracker);
        } catch (error) {
            console.error('Face detection error:', error);
            resolve([]);
        }
    });
};

export const validateImageWithFallback = async (imageElement: HTMLImageElement): Promise<ImageValidationResult> => {
    try {
        return await validateImageContent(imageElement);
    } catch (error) {
        console.warn('Image validation unavailable, allowing upload:', error);
        // If validation fails completely, allow upload (graceful degradation)
        return {
            isValid: true,
            errors: []
        };
    }
};
