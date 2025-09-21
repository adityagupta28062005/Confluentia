// Shared TypeScript type definitions
export interface ProcessStep {
    id: string;
    name: string;
    description: string;
    type: 'task' | 'gateway' | 'event';
}

export interface Risk {
    name: string;
    category: string;
    description: string;
}

export interface Control {
    name: string;
    type: string;
    description: string;
}

export interface ProcessData {
    process_name: string;
    process_description: string;
    process_map_bpmn_xml: string;
    risk_taxonomy: Risk[];
    controls: Control[];
}

export interface DocumentUpload {
    file: File;
    type: 'pdf' | 'docx' | 'xlsx';
}

export interface ProcessingStatus {
    stage: 'uploading' | 'parsing' | 'extracting' | 'generating' | 'complete' | 'error';
    progress: number;
    message: string;
}