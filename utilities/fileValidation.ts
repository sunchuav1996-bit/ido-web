export const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File size must be less than 10MB'
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Only JPG, PNG, and HEIC formats are supported'
        };
    }

    return { valid: true };
};
