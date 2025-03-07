import React, { useState, useEffect, Suspense, lazy, startTransition } from "react"; import { __ } from "@wordpress/i18n";
import Sticky from 'react-sticky-el';

import Nav from "./components/includes/Nav";
import Footer from "./components/includes/Footer";

const Welcome = lazy(() => import("./components/Welcome"));
const Blocks = lazy(() => import("./components/Blocks"));
const Extensions = lazy(() => import("./components/Extensions"));
const ThirdParty = lazy(() => import("./components/ThirdParty"));
const License = lazy(() => import("./components/License"));
const GetPro = lazy(() => import("./components/includes/GetPro"));
const FAQs = lazy(() => import("./components/FAQs"));
const Reviews = lazy(() => import("./components/Reviews"));

import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
// const SetupWizard = lazy(() => import("./components/includes/SetupWizard"));

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWifi,
  faGears,
  faHeart,
  faArrowsRotate,
  faQuestion,
  faHeadset,
  faObjectGroup,
  faSwatchbook,
  faFolder,
  faKey
} from "@fortawesome/free-solid-svg-icons";

import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const helpCenter = () => {
    return (
      <div className="p-4 min-h-[60vh] w-full text-center bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-900 dark:border-gray-900 flex flex-col items-center justify-center">
        <FontAwesomeIcon icon={faHeadset} className="h-12 w-12 text-gray-400 mb-3" />
        <h5 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Help Center</h5>
        <p className="mb-5 text-base text-gray-500 sm:text-lg dark:text-gray-100">
          If you need help, please contact live chat support for fastest response on <a href="https://wowdevs.com/support" target="_blank" className="text-blue-500">https://wowdevs.com/support</a>
        </p>
      </div>
    );
  }

  const data = [
    {
      label: __('Dashboard', 'blockish'),
      value: "dashboard",
      icon: <FontAwesomeIcon icon={faWifi} className="h-5 w-5" />,
      desc: <Welcome />,
    },
    {
      label: __('Blocks', 'blockish'),
      value: "widgets",
      icon: <FontAwesomeIcon icon={faObjectGroup} className="h-5 w-5" />,
      desc: <Blocks />,
    },
    {
      label: __('Extensions', 'blockish'),
      value: "extensions",
      icon: <FontAwesomeIcon icon={faSwatchbook} className="h-5 w-5" />,
      desc: <Extensions />,
    },
    {
      label: __('3rd Party', 'blockish'),
      value: "thirdparty",
      icon: <FontAwesomeIcon icon={faFolder} className="h-5 w-5" />,
      desc: <ThirdParty />,
    },
    {
      label: BlockishConfig.pro_init ? __('License', 'blockish') : __('Get Pro', 'blockish'),
      value: "license",
      icon: <FontAwesomeIcon icon={faKey} className="h-5 w-5" />,
      desc: BlockishConfig.pro_init ? <License /> : <GetPro />,
    },
    // {
    //     label: __('Settings', 'blockish'),
    //     value: "settings",
    //     icon: <FontAwesomeIcon icon={faGears} className="h-5 w-5" />,
    //     desc: <Settings />,
    // },
    // {
    //     label: __('Reviews', 'blockish'),
    //     value: "reviews",
    //     icon: <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />,
    //     desc: <Reviews />,
    // },
    {
      label: __('FAQs', 'blockish'),
      value: "faqs",
      icon: <FontAwesomeIcon icon={faQuestion} className="h-5 w-5" />,
      desc: <FAQs />,
    },
    {
      label: __('Support', 'blockish'),
      value: "docs",
      icon: <FontAwesomeIcon icon={faHeadset} className="h-5 w-5" />,
      desc: helpCenter(),
    },
    // {
    //     label: __('Setup Wizard', 'blockish'),
    //     value: "setup",
    //     icon: <FontAwesomeIcon icon={faGears} className="h-5 w-5" />,
    //     desc: <SetupWizard />,
    // }
  ];

  const [openModal, setOpenModal] = useState(false);

  const onOpenModal = () => setOpenModal(true);
  const onCloseModal = () => {
    setOpenModal(false);
    const url = window.location.href;
    // if (url.includes('tab=setupWizard')) {
    //     window.history.pushState({}, document.title, url.replace(/&?tab=setupWizard/, ''));
    // }
  }

  useEffect(() => {
    // const url = window.location.href;
    // if (url.includes('tab=setupWizard')) {
    //     setOpenModal(true);
    // }
  }, [openModal]);

  return (
    <>
      {/* <Modal 
            open={openModal} 
            onClose={onCloseModal} 
            center classNames={{ modal: 'blockish' }}
            closeOnEsc={true}
            >   <Suspense fallback={<div>{__('Loading...', 'blockish')}</div>}>
                <SetupWizard />
                </Suspense>
            </Modal> */}
      <Nav />
      <Tabs value={activeTab} orientation="vertical" className="lb-tab flex gap-2 my-6">
        <TabsHeader className="min-w-72 dark:bg-gray-900">
          <Sticky>
            <div className="bg-purple-900 dark:bg-gray-900 p-4 shadow-xl bg-opacity-100 rounded-lg">
              {data.map(({ label, value, icon }) => (
                <Tab
                  key={value}
                  value={value}
                  onClick={() => setActiveTab(value)}
                  className={`flex items-center w-full leading-tight transition-all rounded-lg outline-none text-start justify-start ${activeTab === value ? 'lb-tab-active bg-purple-700 dark:bg-gray-900' : 'hover:bg-purple-700 text-white'}`}
                >
                  <div
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start">
                    <div className="grid mr-4 place-items-center">
                      {icon}
                    </div>
                    {label}
                  </div>
                </Tab>
              ))}
            </div>
          </Sticky>
        </TabsHeader>
        <TabsBody>
          {data.map(({ value, desc }) => (
            <TabPanel key={value} value={value} className="py-0">
              <Suspense fallback={<div>{__('Loading...', 'blockish')}</div>}>
                {desc}
              </Suspense>
            </TabPanel>
          ))}
        </TabsBody>
      </Tabs>

      <Footer />
    </>
  );
}

export default Dashboard;
