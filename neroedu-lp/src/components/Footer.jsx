import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'

export function Footer() {
  return (
    <footer className="flex-none py-16">
      <Container className="flex flex-col items-center justify-between md:flex-row">
        <Logo className="h-12 w-auto text-blue-600" />
        <div className="mt-6 flex flex-col items-center gap-4 md:mt-0 md:flex-row md:gap-8">
          <div className="flex gap-6 text-sm text-blue-600">
            <a href="#features" className="hover:text-blue-800 transition-colors">Features</a>
            <a href="#technology" className="hover:text-blue-800 transition-colors">Technology</a>
            <a href="#download" className="hover:text-blue-800 transition-colors">Download</a>
          </div>
          <p className="text-base text-blue-500">
            Copyright &copy; {new Date().getFullYear()} NeroEdu. Open source project.
          </p>
        </div>
      </Container>
    </footer>
  )
}
