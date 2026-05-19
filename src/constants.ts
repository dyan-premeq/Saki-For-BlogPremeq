import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconZhihu from "@/assets/icons/IconZhihu.svg";
import IconBilibili from "@/assets/icons/IconBilibili.svg";

import { SITE } from "./site_config.ts";

interface Social {
    name: string;
    href: string;
    linkTitle: string;
    icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
    {
        name: "GitHub",
        href: "https://github.com/dyan-premeq/",
        linkTitle: `${SITE.title} of GitHub`,
        icon: IconGitHub,
    },
    {
        name: "X",
        href: "https://x.com/avdyen",
        linkTitle: `${SITE.title} of X`,
        icon: IconBrandX,
    },
    {
        name: "Mail",
        href: "mailto:dyan@premequre.space",
        linkTitle: `Email to ${SITE.title}`,
        icon: IconMail,
    },
    {
        name: "Bilibili",
        href: "https://space.bilibili.com/3546607700150839",
        linkTitle: ``,
        icon: IconBilibili,
    },
    // {
    //   name: "Zhihu",
    //   href: "",
    //   linkTitle: ``,
    //   icon: IconZhihu
    // }
] as const;