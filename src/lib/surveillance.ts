export type FeedType = 'news' | 'webcam';

export interface UnifiedFeed {
  id: string;
  type: FeedType;
  country: string;
  city: string;
  region: string;
  title: string;
  channelId?: string;
  youtubeUrl: string;
  description?: string;
}

export const SURVEILLANCE_FEEDS: UnifiedFeed[] = [
  // --- EUROPE ---
  { id: "de-dw", type: 'news', country: "Germany", city: "Berlin", region: "Europe", title: "DW News", channelId: "UCknLrEdhRCp1aegoMqRaCZg", youtubeUrl: "https://www.youtube.com/embed/live_stream?channel=UCknLrEdhRCp1aegoMqRaCZg" },
  { id: "tr-trt", type: 'news', country: "Turkey", city: "Istanbul", region: "Europe", title: "TRT World", channelId: "UC7fWeaHhqgM4Ry-RMpM2YYw", youtubeUrl: "https://www.youtube.com/embed/live_stream?channel=UC7fWeaHhqgM4Ry-RMpM2YYw" },
  { id: "pl-tvp", type: 'news', country: "Poland", city: "Warsaw", region: "Europe", title: "TVP World", channelId: "UCvMGBE1sIeK5x8dZtB3B5fA", youtubeUrl: "https://www.youtube.com/embed/m4mVcUReR6Y" },
  { id: "ie-rte", type: 'news', country: "Ireland", city: "Dublin", region: "Europe", title: "RTÉ News", channelId: "UCj3EBJmB-x3b5fBpxG2_n_w", youtubeUrl: "https://www.youtube.com/embed/Y3zPtTN-wmQ" },
  { id: "ua-u24", type: 'news', country: "Ukraine", city: "Kyiv", region: "Europe", title: "UNITED24", channelId: "UCc0EEDj2wJz_4H7mGv-h_2Q", youtubeUrl: "https://www.youtube.com/embed/w8ZBdu83tMQ" },
  { id: "uk-ch4", type: 'news', country: "United Kingdom", city: "London", region: "Europe", title: "Channel 4 News", channelId: "UCT6iAerLNE-0J1S_Eklq_sw", youtubeUrl: "https://www.youtube.com/embed/f56tfSVtlo4" },
  { id: "uk-gbnews", type: 'news', country: "United Kingdom", city: "London", region: "Europe", title: "GB News", channelId: "UCUO8-mEok5_ZUSmU1b8o46w", youtubeUrl: "https://www.youtube.com/embed/oI_Zt-jTxQc" },
  { id: "fr-f24fr", type: 'news', country: "France", city: "Paris", region: "Europe", title: "France 24 Français", channelId: "UCCCPCZNChQdGa9EkATeye4g", youtubeUrl: "https://www.youtube.com/embed/l8PMl7tUDIE" },
  { id: "de-dwes", type: 'news', country: "Germany", city: "Berlin", region: "Europe", title: "DW Español", channelId: "UCT4GvRTFl6R0AIEB2oQvNvg", youtubeUrl: "https://www.youtube.com/embed/jRnqxURJ120" },

  // --- MIDDLE EAST & WEST ASIA ---
  { id: "qa-aje", type: 'news', country: "Qatar", city: "Doha", region: "Middle East", title: "Al Jazeera", channelId: "UCNye-wNBqNL5ZzHSJj3l8Bg", youtubeUrl: "https://www.youtube.com/embed/live_stream?channel=UCNye-wNBqNL5ZzHSJj3l8Bg" },
  { id: "il-i24", type: 'news', country: "Israel", city: "Tel Aviv", region: "Middle East", title: "i24NEWS", channelId: "UCaXawI0W3k_n7U9oEsq933Q", youtubeUrl: "https://www.youtube.com/embed/iSuEPISmyNs" },
  { id: "af-tolo", type: 'news', country: "Afghanistan", city: "Kabul", region: "Middle East", title: "TOLOnews", channelId: "UCEwBqHq1e7e4rS202HkUj4g", youtubeUrl: "https://www.youtube.com/embed/gUF7uYD_AnQ" },
  { id: "qa-aja", type: 'news', country: "Qatar", city: "Doha", region: "Middle East", title: "Al Jazeera Arabic", channelId: "UCfiwzLy-8yKzIbsmZTzxDgw", youtubeUrl: "https://www.youtube.com/embed/bNyUyrR0PHo" },

  // --- ASIA ---
  { id: "jp-nhk", type: 'news', country: "Japan", city: "Tokyo", region: "Asia", title: "NHK World", channelId: "UCp2WwK8nQ4BebzD0P-tP-kw", youtubeUrl: "https://www.youtube.com/embed/f0lYkdA-Gtw" },
  { id: "in-ndtv", type: 'news', country: "India", city: "New Delhi", region: "Asia", title: "NDTV", channelId: "UCZFMm1mMw0F81Z37AA81xEQ", youtubeUrl: "https://www.youtube.com/embed/Gm0wjEuXPZI" },
  { id: "hk-scmp", type: 'news', country: "Hong Kong", city: "Hong Kong", region: "Asia", title: "SCMP", channelId: "UCH2wZpB9yAozvM4E_x8sA1g", youtubeUrl: "https://www.youtube.com/embed/jggTnetqeho" },
  { id: "in-firstpost", type: 'news', country: "India", city: "New Delhi", region: "Asia", title: "Firstpost", channelId: "UCz8QaiQxApLq8sLNcszYyJw", youtubeUrl: "https://www.youtube.com/embed/rMydh_-HOY0" },
  { id: "in-indiatoday", type: 'news', country: "India", city: "New Delhi", region: "Asia", title: "India Today", channelId: "UCYPvAwZP8pZhSMW8qsG1XWw", youtubeUrl: "https://www.youtube.com/embed/XhnK1u6iHJw" },
  { id: "tw-taiwanplus", type: 'news', country: "Taiwan", city: "Taipei", region: "Asia", title: "TaiwanPlus News", channelId: "UCGv3O4E0lYx1vEExy9O-W1w", youtubeUrl: "https://www.youtube.com/embed/nT__fkHXsvE" },
  { id: "kr-ytn", type: 'news', country: "South Korea", city: "Seoul", region: "Asia", title: "YTN", channelId: "UChlgI3UHCOnwUGzWzbJ3H5w", youtubeUrl: "https://www.youtube.com/embed/kVBfp6e_Dvc" },

  // --- NORTH AMERICA ---
  { id: "ca-cbc", type: 'news', country: "Canada", city: "Toronto", region: "North America", title: "CBC News", channelId: "UCuFVjoYg9hGzQe0Q1i2-eAg", youtubeUrl: "https://www.youtube.com/embed/ZR6AfSs6iZ8" },
  { id: "ca-global", type: 'news', country: "Canada", city: "Toronto", region: "North America", title: "Global News", channelId: "UChLtXXpo4Ge1ReTEboVvTDg", youtubeUrl: "https://www.youtube.com/embed/QrtJ2foQgfk" },
  { id: "us-cbs2", type: 'news', country: "United States", city: "New York", region: "North America", title: "CBS News", channelId: "UCAeOZZinty8w5A9hX2R-NFA", youtubeUrl: "https://www.youtube.com/embed/nqs9aeQrpGM" },
  { id: "us-abc", type: 'news', country: "United States", city: "New York", region: "North America", title: "ABC News Live", channelId: "UCBi2mrWuNuyYy4gbM6fU18Q", youtubeUrl: "https://www.youtube.com/embed/iipR5yUp36o" },
  { id: "us-foxlive2", type: 'news', country: "United States", city: "New York", region: "North America", title: "LiveNOW from FOX", channelId: "UCJg9wBPyKMNA5sRDNVpz--g", youtubeUrl: "https://www.youtube.com/embed/ooXFU53gMyk" },
  { id: "us-pbs", type: 'news', country: "United States", city: "Washington D.C.", region: "North America", title: "PBS NewsHour", channelId: "UC6ZFN9Tx6xh-skXCuRHCDpQ", youtubeUrl: "https://www.youtube.com/embed/F_Ny5Us_rvw" },
  { id: "us-yahoofinance", type: 'news', country: "United States", city: "New York", region: "North America", title: "Yahoo Finance", channelId: "UCEAZeUIeJs0IjQiqTCdXGQg", youtubeUrl: "https://www.youtube.com/embed/uhD18nS09YQ" },
  { id: "mx-milenio", type: 'news', country: "Mexico", city: "Mexico City", region: "North America", title: "Milenio", channelId: "UCxweB3BWe4lM4qfKkE1Aptw", youtubeUrl: "https://www.youtube.com/embed/tQ941SU5UR0" },

  // --- AFRICA ---
  { id: "cg-africanews", type: 'news', country: "Republic of the Congo", city: "Brazzaville", region: "Africa", title: "Africanews", channelId: "UC0qSGq2LL9h-ZtaQG-oJ_jw", youtubeUrl: "https://www.youtube.com/embed/NQjabLGdP5g" },
  { id: "ng-channels", type: 'news', country: "Nigeria", city: "Lagos", region: "Africa", title: "Channels TV", channelId: "UC1EGNED28BwTqLNbYjB7p9g", youtubeUrl: "https://www.youtube.com/embed/W8nThq62Vb4" },

  // --- OCEANIA ---
  { id: "au-abc", type: 'news', country: "Australia", city: "Sydney", region: "Oceania", title: "ABC News", channelId: "UCzQUP1qoWDoEbEQUBUWE41A", youtubeUrl: "https://www.youtube.com/embed/-X6fW5SoWIM" },

  // --- GLOBAL ---
  { id: "un-webtv", type: 'news', country: "Global", city: "New York", region: "Global", title: "United Nations", channelId: "UC5O114-PQNYkurlTg6hekZw", youtubeUrl: "https://www.youtube.com/embed/vYRfQo6JMxc" }
];

export function getFeedsByType(type: FeedType): UnifiedFeed[] {
  return SURVEILLANCE_FEEDS.filter(f => f.type === type);
}
