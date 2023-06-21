export interface IConfirmationModal{
  title: string,
  content: string,
  confirmButton: string,
  confirmButtonClass: string,
  confirmCallback: () => void;
  backCallback: () => void;
}