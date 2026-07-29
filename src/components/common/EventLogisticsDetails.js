import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Read-only render of a deal's event-logistics details — capacity, rooms,
 * stage, lineup, and entrance fee — shared by the Review Offer modal, the
 * counter-offer details modal, and the Bookings card recap. Empty fields are
 * hidden. `rowClass` matches the surrounding markup ('offer-detail-row' or
 * 'booking-detail-row').
 */
const EventLogisticsDetails = ({ deal, rowClass = 'offer-detail-row' }) => {
  const { t } = useLanguage();
  if (!deal) return null;

  const lineup = Array.isArray(deal.lineup)
    ? deal.lineup.map((a) => (typeof a === 'string' ? a : a?.name)).filter(Boolean)
    : [];
  const hasCapacity = deal.eventCapacity != null && deal.eventCapacity !== '';
  const hasRooms = deal.eventRoomsCount != null && deal.eventRoomsCount !== '';
  const hasStage = !!deal.eventStage;
  const hasEntrance = deal.entranceFee != null && deal.entranceFee !== '';

  if (!hasCapacity && !hasRooms && !hasStage && !hasEntrance && lineup.length === 0) {
    return null;
  }

  return (
    <>
      {hasCapacity && (
        <div className={rowClass}>
          <span className="detail-label">{t('offer.eventCapacity')}</span>
          <span className="detail-value">{Number(deal.eventCapacity).toLocaleString()}</span>
        </div>
      )}
      {(hasRooms || hasStage) && (
        <div className={rowClass}>
          <span className="detail-label">{t('offer.eventRooms')}</span>
          <span className="detail-value">
            {hasRooms && <div>{deal.eventRoomsCount}</div>}
            {hasStage && <div className="detail-subtext">{deal.eventStage}</div>}
          </span>
        </div>
      )}
      {lineup.length > 0 && (
        <div className={`${rowClass} full-width`}>
          <span className="detail-label">{t('offer.lineup')}</span>
          <div className="detail-value">
            {lineup.map((name, i) => (
              <div key={i}>{name}</div>
            ))}
          </div>
        </div>
      )}
      {hasEntrance && (
        <div className={rowClass}>
          <span className="detail-label">{t('offer.tickets')}</span>
          <span className="detail-value">
            <div>{Number(deal.entranceFee).toLocaleString()} {deal.currency}</div>
            {deal.entranceFeeNote && <div className="detail-subtext">{deal.entranceFeeNote}</div>}
          </span>
        </div>
      )}
    </>
  );
};

export default EventLogisticsDetails;
