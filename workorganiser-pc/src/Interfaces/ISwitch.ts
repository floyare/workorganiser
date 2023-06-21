export interface ISwitch {
  variable: boolean | undefined, 
  text?: string, 
  onChange: (e: any) => void
}