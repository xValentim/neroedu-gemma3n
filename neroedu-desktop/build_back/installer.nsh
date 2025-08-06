!include MUI2.nsh

; Título do wizard
!define MUI_WELCOMEPAGE_TITLE "Welcome to NeroEdu installer!"
!define MUI_PAGE_CUSTOMFUNCTION_SHOW MyWelcomeShowCallback
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES

Function MyWelcomeShowCallback
SendMessage $mui.WelcomePage.Text ${WM_SETTEXT} 0 "STR:Welcome to the NeroEdu installer! This wizard will guide you through the installation process on your computer. Please follow the instructions in each step to complete the setup smoothly and successfully.$\n$\nVersion: 1.0"

FunctionEnd
