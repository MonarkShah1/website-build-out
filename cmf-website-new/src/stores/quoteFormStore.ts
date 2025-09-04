import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuoteFormData, UploadedFile } from '../types/quote';
import { getDefaultValues } from '../schemas/quoteFormSchema';

interface QuoteFormStore {
  // Form state
  currentStep: number;
  formData: QuoteFormData;
  fileObjects: Map<string, File>; // Store actual File objects
  isSubmitting: boolean;
  hasError: boolean;
  errorMessage?: string;
  submissionId?: string;
  lastSavedAt?: Date;
  
  // Form actions
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Data update actions
  updateContactData: (data: Partial<QuoteFormData['contact']>) => void;
  updateProjectData: (data: Partial<QuoteFormData['project']>) => void;
  updateServicesData: (data: Partial<QuoteFormData['services']>) => void;
  updateMetadata: (data: Partial<QuoteFormData['metadata']>) => void;
  
  // File upload actions
  addFile: (file: UploadedFile, fileObject?: File) => void;
  removeFile: (fileId: string) => void;
  updateFileStatus: (fileId: string, status: UploadedFile['status'], errorMessage?: string) => void;
  clearFiles: () => void;
  getFileObject: (fileId: string) => File | undefined;
  getAllFileObjects: () => File[];
  
  // Form submission actions
  setSubmitting: (isSubmitting: boolean) => void;
  setError: (hasError: boolean, errorMessage?: string) => void;
  setSubmissionId: (id: string) => void;
  
  // Form management
  resetForm: () => void;
  saveProgress: () => void;
  loadSavedProgress: () => void;
  
  // Validation state
  stepValidation: Record<number, boolean>;
  setStepValidation: (step: number, isValid: boolean) => void;
  canProceedToStep: (step: number) => boolean;
}

const TOTAL_STEPS = 4;
const STORAGE_KEY = 'cmf-quote-form';

export const useQuoteFormStore = create<QuoteFormStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 1,
      formData: getDefaultValues(),
      fileObjects: new Map(),
      isSubmitting: false,
      hasError: false,
      errorMessage: undefined,
      submissionId: undefined,
      lastSavedAt: undefined,
      stepValidation: {},
      
      // Step navigation
      setStep: (step) => {
        if (step >= 1 && step <= TOTAL_STEPS) {
          set({ currentStep: step });
          get().saveProgress();
        }
      },
      
      nextStep: () => {
        const { currentStep, canProceedToStep } = get();
        if (currentStep < TOTAL_STEPS && canProceedToStep(currentStep + 1)) {
          set({ currentStep: currentStep + 1 });
          get().saveProgress();
        }
      },
      
      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },
      
      // Data updates
      updateContactData: (data) => {
        set((state) => ({
          formData: {
            ...state.formData,
            contact: { ...state.formData.contact, ...data },
          },
        }));
        get().saveProgress();
      },
      
      updateProjectData: (data) => {
        set((state) => ({
          formData: {
            ...state.formData,
            project: { ...state.formData.project, ...data },
          },
        }));
        get().saveProgress();
      },
      
      updateServicesData: (data) => {
        set((state) => ({
          formData: {
            ...state.formData,
            services: { ...state.formData.services, ...data },
          },
        }));
        get().saveProgress();
      },
      
      updateMetadata: (data) => {
        set((state) => ({
          formData: {
            ...state.formData,
            metadata: { ...state.formData.metadata, ...data },
          },
        }));
      },
      
      // File management
      addFile: (file, fileObject) => {
        set((state) => {
          const newFileObjects = new Map(state.fileObjects);
          if (fileObject) {
            newFileObjects.set(file.id, fileObject);
          }
          return {
            formData: {
              ...state.formData,
              files: [...state.formData.files, file],
            },
            fileObjects: newFileObjects,
          };
        });
        get().saveProgress();
      },
      
      removeFile: (fileId) => {
        set((state) => {
          const newFileObjects = new Map(state.fileObjects);
          newFileObjects.delete(fileId);
          
          // Revoke the blob URL to free memory
          const file = state.formData.files.find(f => f.id === fileId);
          if (file?.url && file.url.startsWith('blob:')) {
            URL.revokeObjectURL(file.url);
          }
          
          return {
            formData: {
              ...state.formData,
              files: state.formData.files.filter((f) => f.id !== fileId),
            },
            fileObjects: newFileObjects,
          };
        });
        get().saveProgress();
      },
      
      updateFileStatus: (fileId, status, errorMessage) => {
        set((state) => ({
          formData: {
            ...state.formData,
            files: state.formData.files.map((f) =>
              f.id === fileId
                ? { ...f, status, errorMessage }
                : f
            ),
          },
        }));
      },
      
      clearFiles: () => {
        set((state) => {
          // Revoke all blob URLs
          state.formData.files.forEach(file => {
            if (file.url && file.url.startsWith('blob:')) {
              URL.revokeObjectURL(file.url);
            }
          });
          
          return {
            formData: {
              ...state.formData,
              files: [],
            },
            fileObjects: new Map(),
          };
        });
        get().saveProgress();
      },
      
      getFileObject: (fileId) => {
        return get().fileObjects.get(fileId);
      },
      
      getAllFileObjects: () => {
        return Array.from(get().fileObjects.values());
      },
      
      // Submission management
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      
      setError: (hasError, errorMessage) => set({ hasError, errorMessage }),
      
      setSubmissionId: (submissionId) => set({ submissionId }),
      
      // Form management
      resetForm: () => {
        const state = get();
        // Revoke all blob URLs before resetting
        state.formData.files.forEach(file => {
          if (file.url && file.url.startsWith('blob:')) {
            URL.revokeObjectURL(file.url);
          }
        });
        
        set({
          currentStep: 1,
          formData: getDefaultValues(),
          fileObjects: new Map(),
          isSubmitting: false,
          hasError: false,
          errorMessage: undefined,
          submissionId: undefined,
          stepValidation: {},
        });
        // Clear persisted data
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
      },
      
      saveProgress: () => {
        set({ lastSavedAt: new Date() });
      },
      
      loadSavedProgress: () => {
        // This is handled by the persist middleware
        const savedData = get();
        if (savedData.lastSavedAt) {
          console.log('Loaded saved progress from:', savedData.lastSavedAt);
        }
      },
      
      // Validation
      setStepValidation: (step, isValid) => {
        set((state) => ({
          stepValidation: {
            ...state.stepValidation,
            [step]: isValid,
          },
        }));
      },
      
      canProceedToStep: (targetStep) => {
        const { stepValidation } = get();
        
        // Can always go back
        if (targetStep < get().currentStep) return true;
        
        // Check if all previous steps are valid
        for (let i = 1; i < targetStep; i++) {
          if (!stepValidation[i]) return false;
        }
        
        return true;
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
        lastSavedAt: state.lastSavedAt,
        stepValidation: state.stepValidation,
      }),
      version: 1,
    }
  )
);

// Helper hook for step-specific data
export const useStepData = (step: number) => {
  const store = useQuoteFormStore();
  
  switch (step) {
    case 1:
      return {
        data: store.formData.contact,
        update: store.updateContactData,
      };
    case 2:
      return {
        data: store.formData.project,
        update: store.updateProjectData,
      };
    case 3:
      return {
        data: store.formData.files,
        add: store.addFile,
        remove: store.removeFile,
        updateStatus: store.updateFileStatus,
      };
    case 4:
      return {
        data: store.formData.services,
        update: store.updateServicesData,
      };
    default:
      return null;
  }
};