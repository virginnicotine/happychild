import React from "react";

import { Text } from "@gravity-ui/uikit";

interface LandingPageFooterProps {
  copyrightText: string;
  links: Array<{
    text: string;
    url: string;
  }>;
  yandexCompany: {
    text: string;
    url: string;
  };
}

const LandingPageFooter = ({
  copyrightText,
  links,
  yandexCompany,
}: LandingPageFooterProps) => {
  return (
    <footer className="footer">
      <Text variant="body-2" color="secondary">
        {copyrightText}
      </Text>
      <ul className="links">
        {links.map((link) => (
          <li key={link.url}>
            <a href={link.url} className="link">
              <Text variant="body-2">{link.text}</Text>
            </a>
          </li>
        ))}
      </ul>
      <div className="yandexCompany">
        <Text variant="body-2">{yandexCompany.text}</Text>
        <a href={yandexCompany.url} className="yandexCompanyLogo link">
          <svg
            viewBox="0 0 58 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.50997 15.7284H10.9001V2H7.42355C3.92725 2 2.09022 3.79753 2.09022 6.44444C2.09022 8.55802 3.09763 9.80246 4.89516 11.0864L1.77417 15.7284H4.36182L7.83836 10.5333L6.63343 9.72345C5.1717 8.7358 4.46059 7.96543 4.46059 6.30617C4.46059 4.84444 5.48775 3.85679 7.4433 3.85679H8.50997V15.7284ZM39.8976 15.0568V13.1407C39.1667 13.6346 37.942 14.0691 36.7964 14.0691C35.0778 14.0691 34.426 13.2593 34.3272 11.6H39.9964V10.3555C39.9964 6.89876 38.4754 5.59506 36.1248 5.59506C33.2606 5.59506 31.8976 7.78765 31.8976 10.7901C31.8976 14.2469 33.5964 15.9259 36.5988 15.9259C38.1001 15.9259 39.2062 15.5309 39.8976 15.0568ZM54.5939 15.9259C55.6803 15.9259 56.4507 15.7284 57.0235 15.3136V13.3975C56.4309 13.8123 55.7198 14.0691 54.7322 14.0691C53.0532 14.0691 52.3618 12.7654 52.3618 10.7111C52.3618 8.55802 53.2112 7.45185 54.7519 7.45185C55.6606 7.45185 56.5494 7.7679 57.0235 8.06419V6.06913C56.5297 5.79259 55.6606 5.59506 54.4951 5.59506C51.4926 5.59506 49.9322 7.74814 49.9322 10.7704C49.9322 14.0889 51.4531 15.9259 54.5939 15.9259ZM18.3667 5.79259V9.72345H15.226V5.79259H12.8754V15.7284H15.226V11.5802H18.3667V15.7284H20.7174V5.79259H18.3667ZM31.3248 13.8716H30.2779V5.79259H23.4235V6.64197C23.4235 9.0716 23.2655 12.2123 22.4359 13.8716H21.705V18H23.8779V15.7284H29.1519V18H31.3248V13.8716ZM47.4038 15.7284H50.0704L46.2976 10.3753L49.6161 5.79259H47.2457L43.9272 10.3753V5.79259H41.5766V15.7284H43.9272V10.8494L47.4038 15.7284ZM36.0853 7.45185C37.2507 7.45185 37.6062 8.41975 37.6062 9.66419V9.86172H34.3272C34.3865 8.28148 34.9593 7.45185 36.0853 7.45185ZM27.9272 13.8716H24.6087C25.2606 12.3704 25.4384 9.66419 25.4384 7.94567V7.64938H27.9272V13.8716Z"
              fill="black"
              fill-opacity="0.85"
            />
          </svg>
        </a>
      </div>
    </footer>
  );
};

export default LandingPageFooter;
