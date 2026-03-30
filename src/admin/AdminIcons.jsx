// src/admin/AdminIcons.jsx
import React from 'react';

const IconProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "nav-icon-svg"
};

export const Icons = {
    Dashboard: () => (
        <svg {...IconProps}>
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    Categories: () => (
        <svg {...IconProps}>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
    ),
    Hotels: () => (
        <svg {...IconProps}>
            <path d="M3 21h18" /><path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" />
            <path d="M9 18v3" /><path d="M15 18v3" /><path d="M9 9h6" /><path d="M9 13h6" />
        </svg>
    ),
    Restaurants: () => (
        <svg {...IconProps}>
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
    ),
    Guides: () => (
        <svg {...IconProps}>
            <circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
        </svg>
    ),
    Map: () => (
        <svg {...IconProps}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
        </svg>
    ),
    External: () => (
        <svg {...IconProps} style={{ width: 16, height: 16 }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    ),
    Plus: () => (
        <svg {...IconProps}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    Trash: () => (
        <svg {...IconProps}>
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    Close: () => (
        <svg {...IconProps}>
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    Upload: () => (
        <svg {...IconProps}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    ),
    Star: ({ fill = "none" }) => (
        <svg {...IconProps} fill={fill}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    Pepper: () => (
        <svg {...IconProps} fill="currentColor">
            <path d="M12 2c-.6 0-1.1.4-1.3.9l-1 2.3c2.6.4 4.5 2.7 4.5 5.5 0 2.8-1.9 5.1-4.5 5.5l1 2.3c.2.5.7.9 1.3.9h0c3.3 0 6-2.7 6-6V8c0-3.3-2.7-6-6-6Z" />
            <path d="M7 6c-2.2 0-4 1.8-4 4v2c0 2.2 1.8 4 4 4h0c2.2 0 4-1.8 4-4v-2c0-2.2-1.8-4-4-4Z" />
        </svg>
    ),
    Pin: () => (
        <svg {...IconProps}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
    ),
    WiFi: () => (
        <svg {...IconProps}><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
    ),
    Coffee: () => (
        <svg {...IconProps}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
    ),
    Pool: () => (
        <svg {...IconProps}><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /></svg>
    ),
    SPA: () => (
        <svg {...IconProps}><path d="M12 21c-4.42 0-8-3.58-8-8 0-4.42 3.58-8 8-8s8 3.58 8 8c0 4.42-3.58 8-8 8Z" /><path d="M12 2v3" /><path d="M12 10v3" /><path d="M12 18v1" /></svg>
    ),
    Gym: () => (
        <svg {...IconProps}><path d="M6.5 6.5 4 9" /><path d="m17.5 17.5 2.5-2.5" /><path d="m3 21 2-2" /><path d="m21 3-2 2" /><path d="m2.5 19 3-3" /><path d="m18.5 5 3-3" /><path d="M7 6l11 11" /></svg>
    ),
    AC: () => (
        <svg {...IconProps}><path d="M12 2v20" /><path d="m4.93 4.93 14.14 14.14" /><path d="M2 12h20" /><path d="m19.07 4.93-14.14 14.14" /></svg>
    ),
    Eye: () => (
        <svg {...IconProps}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    Users: () => (
        <svg {...IconProps}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    Leaf: () => (
        <svg {...IconProps}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8.5C19 15.5 16 21 11 20Z" /><path d="M7 22c5-5 7-10 7-10" /></svg>
    ),
    Flame: () => (
        <svg {...IconProps}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.292 1-3a2.5 2.5 0 0 0 2.5 2.5Z" /></svg>
    ),
    Clock: () => (
        <svg {...IconProps}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    Bed: () => (
        <svg {...IconProps}><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>
    ),
    Couch: () => (
        <svg {...IconProps}><path d="M3 13V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" /><path d="M3 11h18" /><path d="M2 20h20" /><path d="M5 20v-7" /><path d="M19 20v-7" /></svg>
    ),
    Crown: () => (
        <svg {...IconProps}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7Z" /><path d="M12 17H12" /></svg>
    ),
    Key: () => (
        <svg {...IconProps}><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3" /></svg>
    ),
    Tent: () => (
        <svg {...IconProps}><path d="M3.5 21 12 3l8.5 18" /><path d="M12 21V11" /><path d="m7 21 5-10 5 10" /></svg>
    ),
    Article: () => (
        <svg {...IconProps}>
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
        </svg>
    )
};
