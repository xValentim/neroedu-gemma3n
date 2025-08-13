import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import Image from 'next/image'
import ollamaImage from '@/images/ollama.png'

const downloadOptions = [
  {
    name: 'Windows',
    icon: '🪟',
    description: 'Download for Windows 10/11',
    downloadUrl: 'https://neroedu.s3.us-east-1.amazonaws.com/NeroEdu+Setup+4.6.0.exe',
    fileSize: '~450 MB',
    requirements: 'Windows 10 or later'
  },
  /*{
    name: 'macOS',
    icon: '🍎',
    description: 'Download for macOS',
    downloadUrl: '#',
    fileSize: '~180 MB',
    requirements: 'macOS 10.15 or later'
  },*/
  /*{
    name: 'Linux',
    icon: '🐧',
    description: 'Download for Linux',
    downloadUrl: '#',
    fileSize: '~120 MB',
    requirements: 'Ubuntu 20.04+ / Debian 11+'
  }*/
]

const requirements = [
  {
    title: 'System Requirements',
    items: [
      '4GB RAM minimum (8GB recommended)',
      '2GB free disk space',
      'Ollama installed and running',
      'Internet connection for initial setup'
    ]
  },
  {
    title: 'Ollama Setup',
    items: [
      'Download Ollama from ollama.com',
      'Install and start Ollama service',
      'Download Gemma models (2B or 4B)',
      'Configure NeroEdu to connect to Ollama'
    ],
    image: ollamaImage,
    imageAlt: 'Ollama - Local AI Model Runner'
  }
]

export function Download() {
  return (
    <section id="download" aria-label="Download" className="py-20 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-medium tracking-tighter text-blue-600 sm:text-5xl">
            Ready to revolutionize your learning?
          </h2>
          <p className="mt-4 font-display text-2xl tracking-tight text-blue-900">
            Download NeroEdu today and experience the future of AI-powered education.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className={`grid grid-cols-1 gap-8 md:grid-cols-${downloadOptions.length}`}>
            {downloadOptions.map((option) => (
              <div
                key={option.name}
                className="group relative rounded-2xl border border-blue-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-300"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">{option.icon}</div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">
                    {option.name}
                  </h3>
                  <p className="text-blue-700 mb-4">{option.description}</p>
                  <div className="space-y-2 mb-6 text-sm text-blue-600">
                    <div className="font-mono bg-blue-50 px-3 py-1 rounded">
                      {option.fileSize}
                    </div>
                    <div className="text-xs">{option.requirements}</div>
                  </div>
                  <Button
                    href={option.downloadUrl}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    Download for {option.name}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-4xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {requirements.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-blue-200 bg-white p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  {section.image && (
                    <Image
                      src={section.image}
                      alt={section.imageAlt || section.title}
                      width={40}
                      height={40}
                      className="h-8 w-auto object-contain"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-blue-900">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <span className="text-blue-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/*    
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Need Help Getting Started?
            </h3>
            <p className="text-blue-700 mb-6">
              Check out our comprehensive setup guide and documentation to get NeroEdu running on your system.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                href="#"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                📖 Setup Guide
              </Button>
              <Button
                href="#"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                📚 Documentation
              </Button>
              <Button
                href="#"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                💬 Support
              </Button>
            </div>
          </div>
        </div>*/}

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              NeroEdu is Free and Open Source
            </h3>
            <p className="text-green-700 mb-4">
              Join our community of educators and students. Contribute, learn, and help shape the future of AI-powered education.
            </p>
            <Button
              href="https://github.com/xValentim/neroedu-gemma3n"
              target="_blank"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              🌟 Star on GitHub
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
} 