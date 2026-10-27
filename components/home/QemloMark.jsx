export default function QemloMark({
  size = 42,
  className = "",
  tailColor = "#FFFFFF",
  dotColor = "#FF5B04",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Arabic Qaf Two Orange Dots (top right above the head loop) */}
      <circle cx="78" cy="22" r="7" fill={dotColor} />
      <circle cx="95" cy="24" r="7" fill={dotColor} />

      {/* Arabic Qaf Isolated Calligraphic Letterform */}
      <path
        d="M93.5 35.8C89.2 32.5 82.5 31.8 77.2 33.6C70.6 35.8 66.8 41.5 67.8 48.2C68.6 53.6 72.8 57.5 78.4 58.0C80.2 58.1 82.0 57.8 83.8 57.0C81.8 64.2 77.2 72.5 70.4 79.5C62.2 88.0 51.5 93.0 39.5 93.5C26.5 94.0 16.2 88.5 12.2 82.0C10.8 79.8 12.8 77.2 15.2 78.2C22.8 81.5 31.8 82.2 41.0 79.8C52.5 76.8 62.4 69.2 68.8 58.0C64.5 56.5 61.5 52.8 61.0 47.8C60.2 40.0 66.0 32.8 74.8 30.2C82.8 27.8 91.5 29.2 96.5 34.0C97.5 35.0 95.5 37.2 93.5 35.8ZM74.5 49.5C71.8 49.2 69.8 46.8 70.2 43.8C70.6 40.8 73.2 38.8 76.2 39.2C79.2 39.6 81.2 42.2 80.8 45.2C80.4 48.0 77.5 49.8 74.5 49.5Z"
        fill={tailColor}
      />
    </svg>
  );
}
