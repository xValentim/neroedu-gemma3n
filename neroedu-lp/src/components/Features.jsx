'use client'

import { useEffect, useId, useState } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import { DiamondIcon } from '@/components/DiamondIcon'

const features = [
  {
    name: 'Essay Review',
    description: 'Advanced AI-powered essay evaluation with detailed feedback',
    icon: '📝',
    details: [
      {
        title: 'ENEM Competency Analysis',
        description: 'Detailed evaluation across 5 competencies with specific feedback and scoring',
        icon: '🎯'
      },
      {
        title: 'Multi-Exam Support',
        description: 'Support for ENEM, SAT, IELTS, Gaokao, and Portuguese National Exams',
        icon: '🌍'
      },
      {
        title: 'Essay History',
        description: 'Save and manage your essays with full CRUD functionality',
        icon: '💾'
      },
      {
        title: 'Personalized Feedback',
        description: 'AI-generated suggestions to improve your writing skills',
        icon: '✨'
      }
    ]
  },
  {
    name: 'Practice Tests',
    description: 'Generate customized practice questions for any subject',
    icon: '🧠',
    details: [
      {
        title: 'Smart Question Generation',
        description: 'AI creates contextual questions that require critical thinking',
        icon: '🤖'
      },
      {
        title: 'RAG-Enhanced Content',
        description: 'Questions enriched with relevant educational content',
        icon: '📚'
      },
      {
        title: 'Multiple Choice Format',
        description: 'Standardized test format with detailed explanations',
        icon: '✅'
      },
      {
        title: 'Progressive Difficulty',
        description: 'Adaptive question generation based on your performance',
        icon: '📈'
      }
    ]
  },
  {
    name: 'Study Materials',
    description: 'Create flashcards and key topics for effective learning',
    icon: '📖',
    details: [
      {
        title: 'Interactive Flashcards',
        description: 'AI-generated flashcards with question-answer format',
        icon: '🃏'
      },
      {
        title: 'Key Topics Extraction',
        description: 'Automatically identify and explain the most important concepts',
        icon: '🔑'
      },
      {
        title: 'Content Curation',
        description: 'RAG-powered content selection from educational databases',
        icon: '🎯'
      },
      {
        title: 'Learning Optimization',
        description: 'Spaced repetition and adaptive learning techniques',
        icon: '⚡'
      }
    ]
  }
]

function FeatureIcon({ icon, className }) {
  return (
    <div className={clsx(
      'flex h-16 w-16 items-center justify-center rounded-2xl text-3xl',
      className
    )}>
      {icon}
    </div>
  )
}

export function Features() {
  let id = useId()
  let [tabOrientation, setTabOrientation] = useState('horizontal')

  useEffect(() => {
    let lgMediaQuery = window.matchMedia('(min-width: 1024px)')

    function onMediaQueryChange({ matches }) {
      setTabOrientation(matches ? 'vertical' : 'horizontal')
    }

    onMediaQueryChange(lgMediaQuery)
    lgMediaQuery.addEventListener('change', onMediaQueryChange)

    return () => {
      lgMediaQuery.removeEventListener('change', onMediaQueryChange)
    }
  }, [])

  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="py-20 sm:py-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="features-title"
            className="font-display text-4xl font-medium tracking-tighter text-blue-600 sm:text-5xl"
          >
            Powerful Features
          </h2>
          <p className="mt-4 font-display text-2xl tracking-tight text-blue-900">
            Discover how NeroEdu revolutionizes your learning experience with cutting-edge AI technology.
          </p>
        </div>
        
        {/* Mobile and Tablet Layout */}
        <div className="mt-14 lg:hidden">
          <TabGroup
            className="grid grid-cols-1 items-start gap-x-8 gap-y-8 sm:mt-16 sm:gap-y-16"
            vertical={tabOrientation === 'vertical'}
          >
            <div className="relative -mx-4 flex overflow-x-auto pb-4 sm:mx-0 sm:block sm:overflow-visible sm:pb-0">
              <div className="absolute top-2 bottom-0 left-0.5 hidden w-px bg-slate-200 sm:block" />
              <TabList className="grid auto-cols-auto grid-flow-col justify-start gap-x-8 gap-y-10 px-4 whitespace-nowrap sm:mx-auto sm:max-w-2xl sm:grid-cols-3 sm:px-0 sm:text-center">
                {({ selectedIndex }) => (
                  <>
                    {features.map((feature, featureIndex) => (
                      <div key={feature.name} className="relative sm:pl-8">
                        <DiamondIcon
                          className={clsx(
                            'absolute top-2.25 left-[-0.5px] hidden h-1.5 w-1.5 overflow-visible sm:block',
                            featureIndex === selectedIndex
                              ? 'fill-blue-600 stroke-blue-600'
                              : 'fill-transparent stroke-slate-400',
                          )}
                        />
                        <div className="relative">
                          <div
                            className={clsx(
                              'font-mono text-sm',
                              featureIndex === selectedIndex
                                ? 'text-blue-600'
                                : 'text-slate-500',
                            )}
                          >
                            <Tab className="data-selected:not-data-focus:outline-hidden">
                              <span className="absolute inset-0" />
                              {feature.name}
                            </Tab>
                          </div>
                          <p className="mt-1.5 text-lg font-semibold tracking-tight text-blue-900">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </TabList>
            </div>
            <TabPanels>
              {features.map((feature) => (
                <TabPanel
                  key={feature.name}
                  className="data-selected:not-data-focus:outline-hidden"
                  unmount={false}
                >
                  <div className="flex flex-col space-y-8">
                    <div className="flex items-center gap-4">
                      <FeatureIcon 
                        icon={feature.icon} 
                        className="bg-blue-100 text-blue-600"
                      />
                      <div>
                        <h3 className="text-2xl font-bold text-blue-900">{feature.name}</h3>
                        <p className="text-lg text-blue-700">{feature.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {feature.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="group relative">
                          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 transition duration-300 group-hover:opacity-100" />
                          <div className="relative rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl">{detail.icon}</span>
                              <h4 className="font-semibold text-blue-900">{detail.title}</h4>
                            </div>
                            <p className="text-blue-700">{detail.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block mt-14">
          <div className="flex flex-col space-y-16">
            {features.map((feature, featureIndex) => (
              <div key={feature.name} className="flex flex-col space-y-8">
                <div className="flex items-center gap-4">
                  <FeatureIcon 
                    icon={feature.icon} 
                    className="bg-blue-100 text-blue-600"
                  />
                  <div>
                    <h3 className="text-3xl font-bold text-blue-900">{feature.name}</h3>
                    <p className="text-xl text-blue-700">{feature.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  {feature.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="group relative">
                      <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 transition duration-300 group-hover:opacity-100" />
                      <div className="relative rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{detail.icon}</span>
                          <h4 className="font-semibold text-blue-900">{detail.title}</h4>
                        </div>
                        <p className="text-blue-700">{detail.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
} 