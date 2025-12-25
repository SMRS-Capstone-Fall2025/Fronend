import Lottie from "lottie-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface LottieAnimationProps {
  animationData?: unknown;
  animationUrl?: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  width?: number | string;
  height?: number | string;
}

export function LottieAnimation({
  animationData,
  animationUrl,
  className,
  loop = true,
  autoplay = true,
  speed = 1,
  width,
  height,
}: LottieAnimationProps) {
  const style = useMemo(() => {
    const styles: React.CSSProperties = {};
    if (width) styles.width = typeof width === "number" ? `${width}px` : width;
    if (height)
      styles.height = typeof height === "number" ? `${height}px` : height;
    return styles;
  }, [width, height]);

  if (!animationData && !animationUrl) {
    return null;
  }

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={style}
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
        style={style}
      />
    </div>
  );
}

export const LoadingAnimation = () => {
  const loadingAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 30,
    w: 200,
    h: 200,
    nm: "Loading Spinner",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Spinner",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              {
                i: { x: [0.667], y: [1] },
                o: { x: [0.333], y: [0] },
                t: 0,
                s: [0],
              },
              { t: 30, s: [360] },
            ],
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "el",
                s: { a: 0, k: [80, 80] },
                p: { a: 0, k: [0, 0] },
                nm: "Ellipse Path 1",
                mn: "ADBE Vector Shape - Ellipse",
                hd: false,
              },
              {
                ty: "st",
                c: { a: 0, k: [0.2588235294, 0.5254901961, 0.9568627451, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 12 },
                lc: 2,
                lj: 1,
                ml: 4,
                bm: 0,
                nm: "Stroke 1",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false,
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: "Transform",
              },
            ],
            nm: "Ellipse 1",
            np: 2,
            cix: 2,
            bm: 0,
          },
          {
            ty: "tm",
            s: {
              a: 1,
              k: [
                {
                  i: { x: [0.667], y: [1] },
                  o: { x: [0.333], y: [0] },
                  t: 0,
                  s: [0],
                },
                { t: 30, s: [100] },
              ],
            },
            e: {
              a: 1,
              k: [
                {
                  i: { x: [0.667], y: [1] },
                  o: { x: [0.333], y: [0] },
                  t: 0,
                  s: [0],
                },
                { t: 30, s: [75] },
              ],
            },
            o: { a: 0, k: 0 },
            m: 1,
            ix: 5,
            nm: "Trim Paths 1",
            mn: "ADBE Vector Filter - Trim",
            hd: false,
          },
        ],
        ip: 0,
        op: 30,
        st: 0,
        bm: 0,
      },
    ],
  };

  return (
    <LottieAnimation
      animationData={loadingAnimation}
      loop={true}
      autoplay={true}
      width={120}
      height={120}
    />
  );
};

export const EmptyStateAnimation = () => {
  const emptyAnimation = {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 120,
    w: 200,
    h: 200,
    nm: "Empty",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Box",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: {
            a: 1,
            k: [
              {
                i: { x: 0.667, y: 1 },
                o: { x: 0.333, y: 0 },
                t: 0,
                s: [100, 100, 0],
              },
              {
                i: { x: 0.667, y: 1 },
                o: { x: 0.333, y: 0 },
                t: 30,
                s: [100, 80, 0],
              },
              {
                i: { x: 0.667, y: 1 },
                o: { x: 0.333, y: 0 },
                t: 60,
                s: [100, 100, 0],
              },
              { t: 120, s: [100, 100, 0] },
            ],
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [80, 80] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 8 },
                nm: "Rectangle Path 1",
                mn: "ADBE Vector Shape - Rect",
                hd: false,
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.9, 0.9, 0.95, 1] },
                o: { a: 0, k: 100 },
                r: 1,
                bm: 0,
                nm: "Fill 1",
                mn: "ADBE Vector Graphic - Fill",
                hd: false,
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: "Transform",
              },
            ],
            nm: "Rectangle 1",
            np: 2,
            cix: 2,
            bm: 0,
          },
        ],
        ip: 0,
        op: 120,
        st: 0,
        bm: 0,
      },
    ],
  };

  return (
    <LottieAnimation
      animationData={emptyAnimation}
      loop={true}
      autoplay={true}
      width={150}
      height={150}
    />
  );
};

export const ErrorAnimation = () => {
  const errorAnimation = {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: "Error",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "X",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              {
                i: { x: [0.667], y: [1] },
                o: { x: [0.333], y: [0] },
                t: 0,
                s: [0],
              },
              {
                i: { x: [0.667], y: [1] },
                o: { x: [0.333], y: [0] },
                t: 30,
                s: [360],
              },
              { t: 60, s: [360] },
            ],
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              {
                i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
                o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
                t: 0,
                s: [0, 0, 100],
              },
              {
                i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
                o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
                t: 30,
                s: [100, 100, 100],
              },
              { t: 60, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                d: 1,
                pt: { a: 0, k: 4 },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 0 },
                nm: "Polystar Path 1",
                mn: "ADBE Vector Shape - Star",
                hd: false,
              },
              {
                ty: "st",
                c: { a: 0, k: [0.9, 0.2, 0.2, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 6 },
                lc: 2,
                lj: 1,
                ml: 4,
                bm: 0,
                nm: "Stroke 1",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false,
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: "Transform",
              },
            ],
            nm: "Polystar 1",
            np: 2,
            cix: 2,
            bm: 0,
          },
        ],
        ip: 0,
        op: 60,
        st: 0,
        bm: 0,
      },
    ],
  };

  return (
    <LottieAnimation
      animationData={errorAnimation}
      loop={true}
      autoplay={true}
      width={120}
      height={120}
    />
  );
};

export const SuccessAnimation = () => {
  const successAnimation = {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: "Success",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Check",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              {
                i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
                o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
                t: 0,
                s: [0, 0, 100],
              },
              {
                i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
                o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
                t: 20,
                s: [120, 120, 100],
              },
              {
                i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
                o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
                t: 40,
                s: [100, 100, 100],
              },
              { t: 60, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ind: 0,
                ty: "sh",
                ix: 1,
                ks: {
                  a: 0,
                  k: {
                    i: [
                      [0, 0],
                      [0, 0],
                      [0, 0],
                    ],
                    o: [
                      [0, 0],
                      [0, 0],
                      [0, 0],
                    ],
                    v: [
                      [-20, 0],
                      [0, 20],
                      [20, -20],
                    ],
                    c: false,
                  },
                },
                nm: "Path 1",
                mn: "ADBE Vector Shape - Group",
                hd: false,
              },
              {
                ty: "st",
                c: { a: 0, k: [0.2, 0.8, 0.4, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 8 },
                lc: 2,
                lj: 2,
                ml: 4,
                bm: 0,
                nm: "Stroke 1",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false,
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: "Transform",
              },
            ],
            nm: "Shape 1",
            np: 2,
            cix: 2,
            bm: 0,
          },
        ],
        ip: 0,
        op: 60,
        st: 0,
        bm: 0,
      },
    ],
  };

  return (
    <LottieAnimation
      animationData={successAnimation}
      loop={false}
      autoplay={true}
      width={120}
      height={120}
    />
  );
};

export const ShieldScanningAnimation = () => {
  const shieldScanningAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 90,
    w: 200,
    h: 200,
    nm: "Shield Scanning",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Shield",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              {
                i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
                o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
                t: 0,
                s: [80, 80, 100],
              },
              {
                i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
                o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
                t: 30,
                s: [100, 100, 100],
              },
              {
                i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
                o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
                t: 60,
                s: [100, 100, 100],
              },
              { t: 90, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ind: 0,
                ty: "sh",
                ix: 1,
                ks: {
                  a: 0,
                  k: {
                    i: [
                      [0, -20],
                      [15, -10],
                      [20, 0],
                      [15, 10],
                      [0, 20],
                      [-15, 10],
                      [-20, 0],
                      [-15, -10],
                    ],
                    o: [
                      [0, 20],
                      [-15, 10],
                      [-20, 0],
                      [-15, -10],
                      [0, -20],
                      [15, -10],
                      [20, 0],
                      [15, 10],
                    ],
                    v: [
                      [0, -40],
                      [30, -20],
                      [40, 0],
                      [30, 20],
                      [0, 50],
                      [-30, 20],
                      [-40, 0],
                      [-30, -20],
                    ],
                    c: true,
                  },
                },
                nm: "Path 1",
                mn: "ADBE Vector Shape - Group",
                hd: false,
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.2588235294, 0.5254901961, 0.9568627451, 0.3] },
                o: { a: 0, k: 100 },
                r: 1,
                bm: 0,
                nm: "Fill 1",
                mn: "ADBE Vector Graphic - Fill",
                hd: false,
              },
              {
                ty: "st",
                c: { a: 0, k: [0.2588235294, 0.5254901961, 0.9568627451, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 4 },
                lc: 2,
                lj: 1,
                ml: 4,
                bm: 0,
                nm: "Stroke 1",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false,
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: "Transform",
              },
            ],
            nm: "Shield Shape",
            np: 3,
            cix: 2,
            bm: 0,
          },
        ],
        ip: 0,
        op: 90,
        st: 0,
        bm: 0,
      },
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "Scanning Line",
        sr: 1,
        ks: {
          o: {
            a: 1,
            k: [
              {
                i: { x: [0.667], y: [1] },
                o: { x: [0.333], y: [0] },
                t: 0,
                s: [0],
              },
              {
                i: { x: [0.667], y: [1] },
                o: { x: [0.333], y: [0] },
                t: 15,
                s: [100],
              },
              {
                i: { x: [0.667], y: [1] },
                o: { x: [0.333], y: [0] },
                t: 45,
                s: [100],
              },
              {
                i: { x: [0.667], y: [1] },
                o: { x: [0.333], y: [0] },
                t: 60,
                s: [0],
              },
              { t: 90, s: [0] },
            ],
          },
          r: { a: 0, k: 0 },
          p: {
            a: 1,
            k: [
              {
                i: { x: 0.667, y: 1 },
                o: { x: 0.333, y: 0 },
                t: 0,
                s: [100, -30, 0],
              },
              {
                i: { x: 0.667, y: 1 },
                o: { x: 0.333, y: 0 },
                t: 30,
                s: [100, 30, 0],
              },
              {
                i: { x: 0.667, y: 1 },
                o: { x: 0.333, y: 0 },
                t: 60,
                s: [100, -30, 0],
              },
              { t: 90, s: [100, -30, 0] },
            ],
          },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [60, 3] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 2 },
                nm: "Rectangle Path 1",
                mn: "ADBE Vector Shape - Rect",
                hd: false,
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.2588235294, 0.5254901961, 0.9568627451, 0.8] },
                o: { a: 0, k: 100 },
                r: 1,
                bm: 0,
                nm: "Fill 1",
                mn: "ADBE Vector Graphic - Fill",
                hd: false,
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                sk: { a: 0, k: 0 },
                sa: { a: 0, k: 0 },
                nm: "Transform",
              },
            ],
            nm: "Rectangle 1",
            np: 2,
            cix: 2,
            bm: 0,
          },
        ],
        ip: 0,
        op: 90,
        st: 0,
        bm: 0,
      },
    ],
  };

  return (
    <LottieAnimation
      animationData={shieldScanningAnimation}
      loop={true}
      autoplay={true}
      width={150}
      height={150}
    />
  );
};
