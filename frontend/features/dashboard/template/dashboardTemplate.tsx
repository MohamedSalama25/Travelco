import React from 'react'
import HomeProjects from '../components/Projects'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'

export default function DashboardTemplate() {
  return (


    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">


          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <div className="px-4 lg:px-6">
            <HomeProjects />
          </div>

        </div>
      </div>
    </div>

  )
}
