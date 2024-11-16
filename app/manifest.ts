import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WeihnachtsmarktFinder",
    short_name: "WeihnachtsmarktFinder",
    description:
      "Informationen zu Weihnachtsmärkten in Leipzig auf einer Karte",
    start_url: "/",
    display: "standalone",
    background_color: "#091725",
    theme_color: "#BDA33B",
    icons: [
      {
        src: "/favicons/star.png",
        sizes: "80x80",
        type: "image/png",
      },
    ],
  };
}
