import { useState } from "react";
import LocationDetails from "./LocationDetails";
import LocationHours from "./LocationHours";
import DepartmentTab from "./DepartmentTab";
import BankTab from "./BankTab";
import TaxTab from "./TaxTab";
import AgeTab from "./AgeTab";
import FeeTab from "./FeeTab";
import VendorTab from "./VendorTab";

const SetupsMain = () => {
  const [activeTab, setActiveTab] = useState(0);

  const getTabIcon = (iconType) => {
    const iconProps = {
      className: "w-4 h-4",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
    };

    switch (iconType) {
      case "location":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      case "clock":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "department":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case "bank":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 4L12 2l1.5 2M21 10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h16a1 1 0 011 1v1z"
            />
          </svg>
        );
      case "tax":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        );
      case "age":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      case "fee":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        );
      case "vendor":
        return (
          <svg {...iconProps}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 4L12 2l1.5 2M21 10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h16a1 1 0 011 1v1z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const tabs = [
    {
      label: "Location Details",
      icon: "location",
      component: <LocationDetails />,
    },
    {
      label: "Location Hours",
      icon: "clock",
      component: <LocationHours />,
    },
    {
      label: "Department",
      icon: "department",
      component: <DepartmentTab />,
    },
    {
      label: "Bank",
      icon: "bank",
      component: <BankTab />,
    },
    {
      label: "Tax",
      icon: "tax",
      component: <TaxTab />,
    },
    {
      label: "Age",
      icon: "age",
      component: <AgeTab />,
    },
    {
      label: "Fee",
      icon: "fee",
      component: <FeeTab />,
    },
    {
      label: "Vendor",
      icon: "vendor",
      component: <VendorTab />,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tabs Navigation */}
          <div className="px-4 py-3 bg-gray-50 flex-shrink-0">
            <nav className="flex space-x-1">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    activeTab === index
                      ? "bg-orange-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getTabIcon(tab.icon)}
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">{tabs[activeTab].component}</div>
        </div>
      </div>
    </div>
  );
};

export default SetupsMain;
