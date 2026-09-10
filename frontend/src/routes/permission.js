export const permissions = {
  ADMIN: {
    routes: [
      "/admin",
      "/admin/ad-spaces",
      "/admin/pricing",
      "/admin/ads",
    ],

    navigation: [
      {
        label: "Dashboard",
        path: "/admin",
      },
      {
        label: "Ad Spaces",
        path: "/admin/ad-spaces",
      },
      {
        label: "Pricing",
        path: "/admin/pricing",
      },
      {
        label: "Ads",
        path: "/admin/ads",
      },
    ],
  },

  ADVERTISER: {
    routes: [
      "/dashboard",
      "/advertiser/ads",
      "/buy-placement",
      "/orders",
      // "/analytics",
    ],

    navigation: [
      {
        label: "Dashboard",
        path: "/dashboard",
      },
      {
        label: "My Ads",
        path: "/advertiser/ads",
      },
      {
        label: "Buy Placement",
        path: "/buy-placement",
      },
      {
        label: "Orders",
        path: "/orders",
      },
      // {
      //   label: "Analytics",
      //   path: "/analytics",
      // },
    ],
  },
};