import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, onMenuClick, currentView }) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});
  const [activeItem, setActiveItem] = useState("Dashboard");

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleItemClick = (label) => {
    setActiveItem(label);
  };

  const getMenuIcon = (iconType) => {
    const iconProps = {
      className: "w-5 h-5",
      fill: "currentColor",
      viewBox: "0 0 20 20",
    };

    switch (iconType) {
      case "dashboard":
        return (
          <svg {...iconProps}>
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        );
      case "sales":
        return (
          <svg {...iconProps}>
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
          </svg>
        );
      case "inventory":
        return (
          <svg {...iconProps}>
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
      case "finances":
        return (
          <svg {...iconProps}>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "employee":
        return (
          <svg {...iconProps}>
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM5 8a2 2 0 00-2 2v1a2 2 0 002 2v3a2 2 0 002 2h6a2 2 0 002-2v-3a2 2 0 002-2v-1a2 2 0 00-2-2H5z" />
          </svg>
        );
      case "lottery":
        return (
          <svg {...iconProps}>
            <path d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
        );
      case "loyalty":
        return (
          <svg {...iconProps}>
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "reports":
        return (
          <svg {...iconProps}>
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
      case "setups":
        return (
          <svg {...iconProps}>
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return <span className="w-5 h-5 text-center">?</span>;
    }
  };

  const menuItems = [
    { id: 1, label: "Dashboard", icon: "dashboard", route: "/dashboard" },
    { id: 2, label: "Sales", icon: "sales", route: "/dashboard/sales" },
    {
      id: 3,
      label: "Merchandise",
      icon: "inventory",
      hasSubmenu: true,
      submenu: [
        { id: 31, label: "Purchase Order", route: "/dashboard/purchase-order" },
        { id: 32, label: "Items", route: "/dashboard/items" },
        {
          id: 33,
          label: "Inventory Adjustment",
          route: "/dashboard/inventory-adjustment",
        },
        { id: 34, label: "Price Level", route: "/dashboard/price-level" },
        { id: 35, label: "Categories", route: "/dashboard/categories" },
        { id: 36, label: "Item Audit", route: "/dashboard/item-audit" },
        { id: 37, label: "Promotions", route: "/dashboard/promotions" },
      ],
    },
    {
      id: 4,
      label: "Finances",
      icon: "finances",
      route: "/dashboard/finances",
    },
    {
      id: 5,
      label: "Employee",
      icon: "employee",
      route: "/dashboard/employee",
    },
    {
      id: 6,
      label: "Lottery Management",
      icon: "lottery",
      route: "/dashboard/lottery-management",
    },
    {
      id: 7,
      label: "Loyalty Management",
      icon: "loyalty",
      route: "/dashboard/loyalty-management",
    },
    { id: 8, label: "Reports", icon: "reports", route: "/dashboard/reports" },
    { id: 9, label: "Setups", icon: "setups", route: "/dashboard/setups" },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${
        isOpen ? "w-64 md:w-64" : "w-0 md:w-18"
      } ${isOpen ? "fixed md:relative inset-y-0 left-0 z-40 md:z-auto" : ""}`}
    >
      {/* Professional Menu Items */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => {
                      if (item.label === "Merchandise") {
                        // Auto-expand the menu
                        setExpandedItems((prev) => ({
                          ...prev,
                          [item.id]: true,
                        }));
                        handleItemClick(item.label);
                        // Navigate to the first submenu item (Purchase Order)
                        const firstSubmenu = item.submenu[0];
                        navigate(firstSubmenu.route);
                        handleItemClick(firstSubmenu.label);
                      } else {
                        toggleExpanded(item.id);
                        handleItemClick(item.label);
                      }
                    }}
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 gap-3 ${
                      (item.label === "Merchandise" &&
                        (currentView === "inventory" ||
                          currentView === "purchase-order" ||
                          currentView === "create-po" ||
                          currentView === "edit-po" ||
                          currentView === "items" ||
                          currentView === "inventory-adjustment" ||
                          currentView === "price-level" ||
                          currentView === "categories" ||
                          currentView === "item-audit" ||
                          currentView === "promotions")) ||
                      (item.label === "Setups" &&
                        (currentView === "setups" ||
                          currentView.startsWith("setups/")))
                        ? "shadow-sm border-l-4"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    style={
                      (item.label === "Merchandise" &&
                        (currentView === "inventory" ||
                          currentView === "purchase-order" ||
                          currentView === "create-po" ||
                          currentView === "edit-po" ||
                          currentView === "items" ||
                          currentView === "inventory-adjustment" ||
                          currentView === "price-level" ||
                          currentView === "categories" ||
                          currentView === "item-audit" ||
                          currentView === "promotions")) ||
                      (item.label === "Setups" &&
                        (currentView === "setups" ||
                          currentView.startsWith("setups/")))
                        ? {
                            color: "rgb(255 153 25 / var(--tw-bg-opacity))",
                            backgroundColor: "rgba(255, 153, 25, 0.1)",
                            borderLeftColor:
                              "rgb(255 153 25 / var(--tw-bg-opacity))",
                          }
                        : {}
                    }
                  >
                    <span className="w-6 text-center">
                      {getMenuIcon(item.icon)}
                    </span>
                    {(isOpen || window.innerWidth >= 768) && (
                      <>
                        <span className="font-semibold flex-1 text-left text-sm">
                          {item.label}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            expandedItems[item.id] ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                  {expandedItems[item.id] &&
                    (isOpen || window.innerWidth >= 768) && (
                      <ul className="mt-2 ml-6 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.id}>
                            <a
                              href={subItem.route}
                              onClick={(e) => {
                                if (e.button === 0) {
                                  // Only prevent default for left-click
                                  e.preventDefault();
                                  handleItemClick(subItem.label);
                                  navigate(subItem.route);
                                }
                              }}
                              className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 text-sm ${
                                (subItem.label === "Purchase Order" &&
                                  (currentView === "purchase-order" ||
                                    currentView === "create-po" ||
                                    currentView === "edit-po")) ||
                                (subItem.label === "Items" &&
                                  currentView === "items") ||
                                (subItem.label === "Inventory Adjustment" &&
                                  currentView === "inventory-adjustment") ||
                                (subItem.label === "Price Level" &&
                                  currentView === "price-level") ||
                                (subItem.label === "Categories" &&
                                  currentView === "categories") ||
                                (subItem.label === "Item Audit" &&
                                  currentView === "item-audit") ||
                                (subItem.label === "Promotions" &&
                                  currentView === "promotions") ||
                                (subItem.label === "Location Details" &&
                                  currentView === "setups/location-details") ||
                                (subItem.label === "Department" &&
                                  currentView === "setups/department") ||
                                (subItem.label === "Bank" &&
                                  currentView === "setups/bank") ||
                                (subItem.label === "Tax" &&
                                  currentView === "setups/tax") ||
                                (subItem.label === "Age" &&
                                  currentView === "setups/age") ||
                                (subItem.label === "Fee" &&
                                  currentView === "setups/fee") ||
                                (subItem.label === "Vendor" &&
                                  currentView === "setups/vendor")
                                  ? "border-l-2 shadow-sm"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                              }`}
                              style={
                                (subItem.label === "Purchase Order" &&
                                  (currentView === "purchase-order" ||
                                    currentView === "create-po" ||
                                    currentView === "edit-po")) ||
                                (subItem.label === "Items" &&
                                  currentView === "items") ||
                                (subItem.label === "Inventory Adjustment" &&
                                  currentView === "inventory-adjustment") ||
                                (subItem.label === "Price Level" &&
                                  currentView === "price-level") ||
                                (subItem.label === "Categories" &&
                                  currentView === "categories") ||
                                (subItem.label === "Item Audit" &&
                                  currentView === "item-audit") ||
                                (subItem.label === "Promotions" &&
                                  currentView === "promotions") ||
                                (subItem.label === "Location Details" &&
                                  currentView === "setups/location-details") ||
                                (subItem.label === "Department" &&
                                  currentView === "setups/department") ||
                                (subItem.label === "Bank" &&
                                  currentView === "setups/bank") ||
                                (subItem.label === "Tax" &&
                                  currentView === "setups/tax") ||
                                (subItem.label === "Age" &&
                                  currentView === "setups/age") ||
                                (subItem.label === "Fee" &&
                                  currentView === "setups/fee") ||
                                (subItem.label === "Vendor" &&
                                  currentView === "setups/vendor")
                                  ? {
                                      color:
                                        "rgb(255 153 25 / var(--tw-bg-opacity))",
                                      backgroundColor:
                                        "rgba(255, 153, 25, 0.1)",
                                      borderLeftColor:
                                        "rgb(255 153 25 / var(--tw-bg-opacity))",
                                    }
                                  : {}
                              }
                            >
                              <span className="font-medium">
                                {subItem.label}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              ) : (
                <a
                  href={item.route}
                  onClick={(e) => {
                    if (e.button === 0) {
                      // Only prevent default for left-click
                      e.preventDefault();
                      handleItemClick(item.label);
                      navigate(item.route);
                    }
                  }}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 gap-3 ${
                    (item.label === "Dashboard" &&
                      currentView === "dashboard") ||
                    (item.label === "Sales" && currentView === "sales") ||
                    (item.label === "Finances" && currentView === "finances") ||
                    (item.label === "Employee" && currentView === "employee") ||
                    (item.label === "Lottery Management" &&
                      currentView === "lottery-management") ||
                    (item.label === "Loyalty Management" &&
                      currentView === "loyalty-management") ||
                    (item.label === "Reports" && currentView === "reports") ||
                    (item.label === "Setups" && currentView === "setups")
                      ? "shadow-sm border-l-4"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  style={
                    (item.label === "Dashboard" &&
                      currentView === "dashboard") ||
                    (item.label === "Sales" && currentView === "sales") ||
                    (item.label === "Finances" && currentView === "finances") ||
                    (item.label === "Employee" && currentView === "employee") ||
                    (item.label === "Lottery Management" &&
                      currentView === "lottery-management") ||
                    (item.label === "Loyalty Management" &&
                      currentView === "loyalty-management") ||
                    (item.label === "Reports" && currentView === "reports") ||
                    (item.label === "Setups" && currentView === "setups")
                      ? {
                          color: "rgb(255 153 25 / var(--tw-bg-opacity))",
                          backgroundColor: "rgba(255, 153, 25, 0.1)",
                          borderLeftColor:
                            "rgb(255 153 25 / var(--tw-bg-opacity))",
                        }
                      : {}
                  }
                >
                  <span className="w-6 text-center">
                    {getMenuIcon(item.icon)}
                  </span>
                  {(isOpen || window.innerWidth >= 768) && (
                    <span className="font-semibold text-sm">{item.label}</span>
                  )}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
