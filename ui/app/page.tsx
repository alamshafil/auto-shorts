"use client";

import { Card, CardBody } from "@nextui-org/card";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Tooltip } from "@nextui-org/tooltip";

import { WavyBackground } from "@/components/wavy-background";

import AIGen from "@/components/ai";
import { VideoGenerator } from "@/components/video";

import { FaCode, FaMagic } from "react-icons/fa";

export default function Home() {
  return (
    <WavyBackground speed="slow">
      <Card isBlurred className="outline outline-2 outline-white/20 bg-white/80 dark:bg-gray-900/80" shadow="lg">
        <CardBody>
          <section className="flex flex-col justify-center gap-4 p-8 md:p-4">
            <Tabs fullWidth size="lg" variant="bordered" aria-label="Options">
              <Tab key="ai" title={
                <Tooltip showArrow={true} offset={22} content="Generate with AI">
                  <div className="flex items-center gap-2">
                    <FaMagic />
                    <span>Generate with AI</span>
                  </div>
                </Tooltip>
              }>
                <AIGen />
              </Tab>
              <Tab key="manual" title={
                <Tooltip showArrow={true} offset={22} content="Generate Manually">
                  <div className="flex items-center gap-2">
                    <FaCode />
                    <span>Generate Manually</span>
                  </div>
                </Tooltip>
              }>
                <VideoGenerator json={null} />
              </Tab>
            </Tabs>
          </section>
        </CardBody>
      </Card>
    </WavyBackground>
  );
}
