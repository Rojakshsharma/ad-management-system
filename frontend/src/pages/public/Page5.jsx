import { useEffect, useState } from "react";
import { getActiveAd } from "../../services/public.service";
import PublicAdSlot from "../../components/public/PublicAdSlot";

const Page5 = () => {
  const [ads, setAds] = useState({
    TOP: null,
    MID: null,
    BOTTOM: null,
  });

  const [loading, setLoading] = useState(true);

  const loadAds = async () => {
    try {
      const positions = [
        {
          key: "TOP",
          size: "BANNER",
        },
        {
          key: "MID",
          size: "GRID",
        },
        {
          key: "BOTTOM",
          size: "BANNER",
        },
      ];

      const results = await Promise.all(
        positions.map(({ key, size }) =>
          getActiveAd({
            pageNumber: 5,
            position: key,
            size,
          }).catch(() => null)
        )
      );

      setAds({
        TOP: results[0],
        MID: results[1],
        BOTTOM: results[2],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();

    const interval = setInterval(loadAds, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="center-page">
        <p>Loading ads...</p>
      </div>
    );
  }

  return (
    <div className="public-page">
      <header className="public-page-header">
        <h1>Page 5</h1>
      </header>

      <PublicAdSlot
        adResponse={ads.TOP}
        position="TOP"
      />

      <main className="public-page-content">
        <h2>Page 5 Content</h2>
        <p>
          This is the public page where advertisements are displayed.
        </p>
      </main>

      <PublicAdSlot
        adResponse={ads.MID}
        position="MID"
      />

      <PublicAdSlot
        adResponse={ads.BOTTOM}
        position="BOTTOM"
      />
    </div>
  );
};

export default Page5;