import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import processFileAndPrompt from '@salesforce/apex/FileUploadAIProcessor.processFileAndPrompt';

export default class AiTicketAnalyzer extends LightningElement {
    @api recordId;
    
    // Configurable properties (defaults in meta.xml per best practice 7.2)
    @api componentTitle = false;
    @api buttonLabel = false;
    @api maxFileSizeMB = false;
    
    // State management
    @track selectedFile = null;
    @track selectedFileName = '';
    @track selectedFileSize = 0;
    @track base64Data = '';
    @track isProcessing = false;
    @track hasError = false;
    @track errorMessage = '';
    @track hasResult = false;
    @track aiResponse = '';
    @track isOnline = true;

    // Lifecycle hooks
    connectedCallback() {
        // Check initial online status
        this.isOnline = navigator.onLine;
        
        // Add listeners for online/offline events
        window.addEventListener('online', this.handleOnlineStatusChange.bind(this));
        window.addEventListener('offline', this.handleOnlineStatusChange.bind(this));
    }

    disconnectedCallback() {
        // Clean up event listeners
        window.removeEventListener('online', this.handleOnlineStatusChange.bind(this));
        window.removeEventListener('offline', this.handleOnlineStatusChange.bind(this));
    }

    // Online/Offline status handler
    handleOnlineStatusChange() {
        this.isOnline = navigator.onLine;
        
        if (this.isOnline && this.hasError && this.errorMessage.includes('offline')) {
            // Clear offline-related error when coming back online
            this.hasError = false;
            this.errorMessage = '';
        }
    }

    // Computed getters for configurable properties (Best Practice 7.2)
    get displayTitle() {
        return this.componentTitle || 'AI Ticket Analyzer';
    }

    get displayButtonLabel() {
        return this.buttonLabel || 'Analyze with AI';
    }

    get maxFileSize() {
        // Default to 10MB if not specified
        const configuredSize = this.maxFileSizeMB || 10;
        return configuredSize * 1024 * 1024; // Convert to bytes
    }

    // UI State getters
    get isOffline() {
        return !this.isOnline;
    }

    get hasSelectedFile() {
        return this.selectedFile !== null && this.selectedFileName !== '';
    }

    get formattedFileSize() {
        if (this.selectedFileSize === 0) return '';
        
        const kb = this.selectedFileSize / 1024;
        if (kb < 1024) {
            return `${kb.toFixed(1)} KB`;
        }
        return `${(kb / 1024).toFixed(2)} MB`;
    }

    get isAnalyzeDisabled() {
        return !this.hasSelectedFile || this.isProcessing || this.isOffline;
    }

    get uploadDropzoneClass() {
        let baseClass = 'upload-dropzone';
        if (this.hasSelectedFile) {
            baseClass += ' has-file';
        }
        if (this.isOffline) {
            baseClass += ' is-disabled';
        }
        return baseClass;
    }

    // File input trigger (for custom styled upload area)
    triggerFileInput(event) {
        // Prevent event bubbling to avoid double-triggering
        event.stopPropagation();
        
        const fileInput = this.template.querySelector('[data-id="fileInput"]');
        if (fileInput) {
            fileInput.click();
        }
    }

    // Handle file selection
    handleFileChange(event) {
        const file = event.target.files[0];
        
        if (!file) {
            return;
        }

        // Validate file size
        if (file.size > this.maxFileSize) {
            this.showError(`File size exceeds maximum allowed (${this.maxFileSizeMB || 10}MB). Please select a smaller file.`);
            return;
        }

        // Validate file type (only types supported by the AI model)
        // Note: AI model specifically requires .jpg (not .jpeg), .png, or .pdf extensions
        const validExtensions = ['.jpg', '.png', '.pdf'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        if (!validExtensions.includes(fileExtension)) {
            this.showError('Unsupported file type. Please use .jpg, .png, or .pdf files only.\n\nNote: .jpeg files are not supported - please convert to .jpg first.');
            return;
        }

        // Additional MIME type validation for security
        const validMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validMimeTypes.includes(file.type)) {
            this.showError('Invalid file format detected. Please select a valid JPG, PNG, or PDF file.');
            return;
        }

        // Clear any previous errors
        this.hasError = false;
        this.errorMessage = '';
        this.hasResult = false;
        this.aiResponse = '';

        // Store file info
        this.selectedFile = file;
        this.selectedFileName = file.name;
        this.selectedFileSize = file.size;

        // Read file as Base64
        this.readFileAsBase64(file);
    }

    // Read file content as Base64
    readFileAsBase64(file) {
        const reader = new FileReader();
        
        reader.onload = () => {
            // Extract Base64 data (remove data URL prefix)
            const result = reader.result;
            const base64 = result.split(',')[1];
            this.base64Data = base64;
        };

        reader.onerror = () => {
            this.showError('Failed to read the selected file. Please try again.');
        };

        reader.readAsDataURL(file);
    }

    // Handle analyze button click
    async handleAnalyze() {
        // Double-check online status before proceeding
        if (!navigator.onLine) {
            this.isOnline = false;
            this.showError('You are currently offline. AI analysis requires an internet connection. Please reconnect and try again.');
            return;
        }

        // Validate we have the required data
        if (!this.base64Data || !this.selectedFileName) {
            this.showError('Please select a file first.');
            return;
        }

        if (!this.recordId) {
            this.showError('Unable to determine the parent record. Please refresh and try again.');
            return;
        }

        // Start processing
        this.isProcessing = true;
        this.hasError = false;
        this.errorMessage = '';
        this.hasResult = false;

        try {
            // Call Apex controller
            const result = await processFileAndPrompt({
                recordId: this.recordId,
                fileName: this.selectedFileName,
                base64Data: this.base64Data
            });

            // Display result
            this.aiResponse = result;
            this.hasResult = true;

            // Show success toast
            this.dispatchEvent(new ShowToastEvent({
                title: 'Analysis Complete',
                message: 'The handwritten ticket has been analyzed successfully.',
                variant: 'success'
            }));

        } catch (error) {
            console.error('AI Analysis Error:', error);
            
            let errorMsg = 'An unexpected error occurred. Please try again.';
            
            if (error.body && error.body.message) {
                errorMsg = error.body.message;
            } else if (error.message) {
                errorMsg = error.message;
            }
            
            this.showError(errorMsg);
            
        } finally {
            this.isProcessing = false;
        }
    }

    // Copy result to clipboard
    async handleCopyResult() {
        try {
            await navigator.clipboard.writeText(this.aiResponse);
            
            this.dispatchEvent(new ShowToastEvent({
                title: 'Copied',
                message: 'Analysis result copied to clipboard.',
                variant: 'success'
            }));
        } catch (error) {
            // Fallback for browsers that don't support clipboard API
            this.dispatchEvent(new ShowToastEvent({
                title: 'Copy Failed',
                message: 'Unable to copy to clipboard. Please select and copy manually.',
                variant: 'warning'
            }));
        }
    }

    // Reset component state
    handleReset() {
        this.selectedFile = null;
        this.selectedFileName = '';
        this.selectedFileSize = 0;
        this.base64Data = '';
        this.hasError = false;
        this.errorMessage = '';
        this.hasResult = false;
        this.aiResponse = '';
        
        // Reset file input
        const fileInput = this.template.querySelector('[data-id="fileInput"]');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    // Show error helper
    showError(message) {
        this.hasError = true;
        this.errorMessage = message;
        
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error',
            mode: 'sticky'
        }));
    }
}
