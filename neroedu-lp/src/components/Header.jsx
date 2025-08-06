import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { DiamondIcon } from '@/components/DiamondIcon'
import { Logo } from '@/components/Logo'

export function Header() {
  return (
    <header className="relative z-50 flex-none lg:pt-11">
      <Container className="flex flex-wrap items-center justify-center sm:justify-between lg:flex-nowrap">
        <div className="mt-10 lg:mt-0 lg:grow lg:basis-0">
          <Logo className="h-12 w-auto text-blue-600" />
        </div>
        <div className="hidden sm:mt-10 sm:flex lg:mt-0 lg:grow lg:basis-0 lg:justify-end">
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-blue-900 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#technology" className="text-blue-900 hover:text-blue-600 transition-colors">
              Technology
            </a>
            <a href="#download" className="text-blue-900 hover:text-blue-600 transition-colors">
              Download
            </a>
            <Button href="#download" className="ml-4">
              Get Started
            </Button>
          </nav>
        </div>
      </Container>
    </header>
  )
}
