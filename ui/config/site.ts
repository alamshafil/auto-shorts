export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Auto Shorts UI",
  description: "Generate short videos with help of AI",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/alamshafil/auto-shorts/",
    docs: "https://nextui.org",
    // twitter: "https://twitter.com/getnextui",
    // discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://ko-fi.com/shafilalam",
  },
};
