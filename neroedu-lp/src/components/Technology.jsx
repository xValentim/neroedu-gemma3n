'use client'

import { useEffect, useState } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import clsx from 'clsx'
import Image from 'next/image'

import { BackgroundImage } from '@/components/BackgroundImage'
import { Container } from '@/components/Container'
import ollamaImage from '@/images/ollama.png'

const technologies = [
  {
    name: 'AI Models',
    description: 'Powered by cutting-edge Gemma models for intelligent learning',
    icon: '🤖',
    items: [
      {
        name: 'Gemma 3N 2B',
        description: 'Lightweight model for fast responses and efficient processing',
        specs: '2B Parameters • Fast Inference • Low Resource Usage'
      },
      {
        name: 'Gemma 3N 4B',
        description: 'Advanced model for complex analysis and detailed feedback',
        specs: '4B Parameters • High Accuracy • Enhanced Reasoning'
      },
      {
        name: 'Local Execution',
        description: '100% privacy with no data sent to external servers',
        specs: 'Offline Processing • Data Privacy • Customizable',
        image: ollamaImage,
        imageAlt: 'Ollama - Local AI Model Runner'
      }
    ]
  },
  {
    name: 'RAG Technology',
    description: 'Retrieval-Augmented Generation for contextually relevant content',
    icon: '🔍',
    items: [
      {
        name: 'Content Retrieval',
        description: 'Intelligent search through educational databases',
        specs: 'TF-IDF • Semantic Search • Context Matching'
      },
      {
        name: 'Knowledge Enhancement',
        description: 'Enrich responses with relevant educational content',
        specs: 'Multi-Source • Real-time • Adaptive'
      },
      {
        name: 'Lite RAG Option',
        description: 'Toggle RAG functionality for different use cases',
        specs: 'Configurable • Performance Tuning • Flexible Usage'
      }
    ]
  },
  {
    name: 'Exam Support',
    description: 'Comprehensive coverage of major international examinations',
    icon: '📚',
    items: [
      {
        name: 'ENEM (Brazil)',
        description: 'Complete competency-based evaluation system',
        specs: '5 Competencies • Detailed Scoring • Brazilian Standards'
      },
      {
        name: 'SAT (USA)',
        description: 'American college entrance exam preparation',
        specs: 'Critical Reading • Writing • Mathematics'
      },
      {
        name: 'IELTS (International)',
        description: 'English language proficiency assessment',
        specs: 'Academic Writing • Task Response • Coherence'
      },
      {
        name: 'Other Exams',
        description: 'Support for Gaokao, Portuguese National Exams',
        specs: 'Multi-Language • Cultural Adaptation • Local Standards'
      }
    ]
  }
]

function TechnologyCard({ item }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="relative rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
        <h4 className="font-semibold text-blue-900 mb-2">{item.name}</h4>
        <p className="text-blue-700 mb-3">{item.description}</p>
        {item.image && (
          <div className="mb-3 flex justify-center">
            <Image
              src={item.image}
              alt={item.imageAlt || item.name}
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </div>
        )}
        <div className="text-sm text-blue-600 font-mono bg-blue-50 px-3 py-2 rounded-lg">
          {item.specs}
        </div>
      </div>
    </div>
  )
}

function TechnologyTabbed() {
  let [tabOrientation, setTabOrientation] = useState('horizontal')

  useEffect(() => {
    let smMediaQuery = window.matchMedia('(min-width: 640px)')

    function onMediaQueryChange({ matches }) {
      setTabOrientation(matches ? 'vertical' : 'horizontal')
    }

    onMediaQueryChange(smMediaQuery)
    smMediaQuery.addEventListener('change', onMediaQueryChange)

    return () => {
      smMediaQuery.removeEventListener('change', onMediaQueryChange)
    }
  }, [])

  return (
    <TabGroup
      className="mx-auto grid max-w-2xl grid-cols-1 gap-y-6 sm:grid-cols-2 lg:hidden"
      vertical={tabOrientation === 'vertical'}
    >
      <TabList className="-mx-4 flex gap-x-4 gap-y-10 overflow-x-auto pb-4 pl-4 sm:mx-0 sm:flex-col sm:pr-8 sm:pb-0 sm:pl-0">
        {({ selectedIndex }) => (
          <>
            {technologies.map((tech, techIndex) => (
              <div
                key={tech.name}
                className={clsx(
                  'relative w-3/4 flex-none pr-4 sm:w-auto sm:pr-0',
                  techIndex !== selectedIndex && 'opacity-70',
                )}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{tech.icon}</div>
                  <h3 className="text-xl font-semibold tracking-tight text-blue-900">
                    <Tab className="data-selected:not-data-focus:outline-hidden">
                      <span className="absolute inset-0" />
                      {tech.name}
                    </Tab>
                  </h3>
                  <p className="mt-1 text-sm tracking-tight text-blue-700">
                    {tech.description}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </TabList>
      <TabPanels>
        {technologies.map((tech) => (
          <TabPanel
            key={tech.name}
            className="data-selected:not-data-focus:outline-hidden"
          >
            <div className="space-y-6">
              {tech.items.map((item, itemIndex) => (
                <TechnologyCard key={itemIndex} item={item} />
              ))}
            </div>
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  )
}

function TechnologyStatic() {
  return (
    <div className="hidden lg:grid lg:grid-cols-3 lg:gap-x-8">
      {technologies.map((tech) => (
        <section key={tech.name}>
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">{tech.icon}</div>
            <h3 className="text-2xl font-semibold tracking-tight text-blue-900">
              {tech.name}
            </h3>
            <p className="mt-2 text-lg tracking-tight text-blue-700">
              {tech.description}
            </p>
          </div>
          <div className="space-y-6">
            {tech.items.map((item, itemIndex) => (
              <TechnologyCard key={itemIndex} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function Technology() {
  return (
    <section id="technology" aria-label="Technology" className="py-20 sm:py-32">
      <Container className="relative z-10">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-4xl lg:pr-24">
          <h2 className="font-display text-4xl font-medium tracking-tighter text-blue-600 sm:text-5xl">
            Built with cutting-edge technology for the best learning experience.
          </h2>
          <p className="mt-4 font-display text-2xl tracking-tight text-blue-900">
            NeroEdu combines the power of local AI models with advanced RAG technology to provide intelligent, personalized educational support.
          </p>
        </div>
      </Container>
      <div className="relative mt-14 sm:mt-24">
        <BackgroundImage position="right" className="-top-40 -bottom-32" />
        <Container className="relative">
          <TechnologyTabbed />
          <TechnologyStatic />
        </Container>
      </div>
    </section>
  )
} 