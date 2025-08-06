import { BackgroundImage } from '@/components/BackgroundImage'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'

export function Hero() {
  return (
    <div className="relative py-20 sm:pt-36 sm:pb-24">
      <BackgroundImage className="-top-36 -bottom-14" />
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:max-w-4xl lg:px-12">
          <h1 className="font-display text-5xl font-bold tracking-tighter text-blue-600 sm:text-7xl">
            NeroEdu: AI-Powered Education Platform
          </h1>
          <div className="mt-6 space-y-6 font-display text-2xl tracking-tight text-blue-900">
            <p>
              Revolutionary educational platform powered by locally-run Gemma models, providing personalized feedback on essays, practice tests, and study materials.
            </p>
            <p>
              With RAG (Retrieval-Augmented Generation) technology, NeroEdu democratizes access to quality education, offering intelligent support for students preparing for national and international exams.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Button href="#download" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold">
              🚀 Download NeroEdu
            </Button>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-x-10 gap-y-6 sm:mt-16 sm:gap-x-16 sm:gap-y-10 sm:text-center lg:auto-cols-auto lg:grid-flow-col lg:grid-cols-none lg:justify-start lg:text-left">
            {[
              ['Supported Models', '2'],
              ['Exam Types', '6'],
              ['RAG + Gemma', 'Technology'],
              ['100% Local', 'Execution'],
            ].map(([name, value]) => (
              <div key={name}>
                <dt className="font-mono text-sm text-blue-600">{name}</dt>
                <dd className="mt-0.5 text-2xl font-semibold tracking-tight text-blue-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </div>
  )
}
