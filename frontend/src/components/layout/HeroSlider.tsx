import { useCallback, useEffect, useRef, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import {
  ArrowBackIos as PrevIcon,
  ArrowForwardIos as NextIcon,
  FiberManualRecord as DotIcon,
} from "@mui/icons-material";
import { bannerApi } from "@/api/bannerApi";
import { useApi } from "@/hooks/useApi";
import type { Banner } from "@/types";

const SLIDE_INTERVAL = 5000;

// Shown only when no banners exist in the database yet
const FALLBACK_SLIDE = {
  id: -1,
  title: "Discover Premium Products",
  subtitle: "Shop thousands of curated items across every category — delivered fast, priced right.",
  image_url: null as string | null,
};

export const HeroSlider = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { execute: fetchBanners } = useApi(useCallback(() => bannerApi.list(), []));

  useEffect(() => {
    fetchBanners().then((r) => {
      if (r.data && Array.isArray(r.data) && r.data.length > 0) {
        setBanners(r.data);
      }
    });
  }, [fetchBanners]);

  const slides = banners.length > 0 ? banners : [FALLBACK_SLIDE];
  const total = slides.length;

  const goNext = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const goPrev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    timerRef.current = setInterval(goNext, SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext, isPaused, total]);

  const slide = slides[current];

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: { xs: 380, sm: 460, md: 580 },
        bgcolor: "#0f172a",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((s, idx) => (
        <Box
          key={s.id}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: idx === current ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
            zIndex: idx === current ? 1 : 0,
          }}
        >
          {s.image_url ? (
            <>
              <Box
                component="img"
                src={s.image_url}
                alt={s.title}
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {/* gradient overlay — left-heavy so text stays readable */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.08) 100%)",
                }}
              />
            </>
          ) : (
            /* Fallback gradient background when no banners uploaded yet */
            <Box
              sx={{
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
              }}
            />
          )}
        </Box>
      ))}

      {/* Text content — no buttons, just title + subtitle */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          pl: { xs: 3, sm: 6, md: 10 },
          pr: { xs: 3, sm: 6, md: "40%" },
        }}
      >
        <Box>
          <Typography
            component="span"
            sx={{
              display: "inline-block",
              bgcolor: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(6px)",
              color: "rgba(255,255,255,0.9)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              mb: 2,
            }}
          >
            {(slide as Banner).is_active !== false ? "Featured Collection" : "New Arrivals"}
          </Typography>

          <Typography
            variant="h2"
            fontWeight={900}
            sx={{
              color: "white",
              fontSize: { xs: "1.9rem", sm: "2.5rem", md: "3.4rem" },
              lineHeight: 1.12,
              mb: 2,
              textShadow: "0 2px 24px rgba(0,0,0,0.4)",
              maxWidth: 600,
            }}
          >
            {slide.title}
          </Typography>

          {slide.subtitle && (
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.82)",
                lineHeight: 1.7,
                fontSize: { xs: "0.95rem", md: "1.1rem" },
                maxWidth: 480,
              }}
            >
              {slide.subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Prev arrow */}
      <IconButton
        onClick={goPrev}
        sx={{
          position: "absolute",
          left: { xs: 8, md: 20 },
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 3,
          width: 44,
          height: 44,
          bgcolor: "rgba(255,255,255,0.12)",
          color: "white",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.18)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
          transition: "all 0.2s",
        }}
      >
        <PrevIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* Next arrow */}
      <IconButton
        onClick={goNext}
        sx={{
          position: "absolute",
          right: { xs: 8, md: 20 },
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 3,
          width: 44,
          height: 44,
          bgcolor: "rgba(255,255,255,0.12)",
          color: "white",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.18)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
          transition: "all 0.2s",
        }}
      >
        <NextIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* Dot indicators */}
      <Box
        sx={{
          position: "absolute",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          gap: 0.75,
        }}
      >
        {slides.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => setCurrent(idx)}
            sx={{
              width: idx === current ? 28 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: idx === current ? "white" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": { bgcolor: "rgba(255,255,255,0.75)" },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
