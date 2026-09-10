import { useEffect, useRef } from "react";
import {
  recordClick,
  recordImpression,
} from "../../services/event.service";

const PublicAdSlot = ({ adResponse, position }) => {
  const impressionRecorded = useRef(false);

  const ad = adResponse?.data?.ad;
  const slot = adResponse?.data?.slot;
  const adSpace = adResponse?.data?.adSpace;

  useEffect(() => {
    if (!ad || !slot || !adSpace) {
      return;
    }

    const storageKey = `impression_${slot.id}`;

    if (sessionStorage.getItem(storageKey)) {
      impressionRecorded.current = true;
      return;
    }

    if (impressionRecorded.current) {
      return;
    }

    const record = async () => {
      try {
        impressionRecorded.current = true;

        await recordImpression({
          adId: ad.id,
          orderId: slot.orderId,
          adSpaceId: adSpace.id,
          startedAt: new Date().toISOString(),
          endedAt: slot.endAt,
        });

        sessionStorage.setItem(storageKey, "true");
      } catch (error) {
        impressionRecorded.current = false;
        console.error(
          "Failed to record impression:",
          error.response?.data?.message || error.message
        );
      }
    };

    record();
  }, [ad, slot, adSpace]);

  const handleClick = async () => {
    if (!ad || !slot || !adSpace) {
      return;
    }

    try {
      await recordClick({
        adId: ad.id,
        orderId: slot.orderId,
        adSpaceId: adSpace.id,
      });
    } catch (error) {
      console.error(
        "Failed to record click:",
        error.response?.data?.message || error.message
      );
    }
  };

  if (!ad) {
    return (
      <div className={`public-ad-slot ${position.toLowerCase()}`}>
        <span>No active ad</span>
      </div>
    );
  }

  return (
    <div className={`public-ad-slot ${position.toLowerCase()}`}>
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
      >
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.title}
          />
        )}

        <div>
          <h3>{ad.title}</h3>
          <p>{ad.description}</p>
        </div>
      </a>
    </div>
  );
};

export default PublicAdSlot;