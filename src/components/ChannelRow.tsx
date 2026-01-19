import clsx from "clsx";
import { ChannelPerformance } from "../data/types";

const statusLabels: Record<ChannelPerformance["status"], string> = {
  growing: "Growing",
  steady: "Steady",
  declining: "Declining"
};

const ChannelRow = ({
  name,
  category,
  averageViewers,
  peakViewers,
  followersGained,
  liveMinutes,
  status
}: ChannelPerformance) => {
  return (
    <div className="channel-row">
      <div>
        <p className="channel-row__name">{name}</p>
        <p className="channel-row__meta">{category}</p>
      </div>
      <div className="channel-row__metrics">
        <div>
          <p className="channel-row__label">Avg Viewers</p>
          <p className="channel-row__value">{averageViewers.toLocaleString()}</p>
        </div>
        <div>
          <p className="channel-row__label">Peak</p>
          <p className="channel-row__value">{peakViewers.toLocaleString()}</p>
        </div>
        <div>
          <p className="channel-row__label">Followers</p>
          <p className="channel-row__value">+{followersGained.toLocaleString()}</p>
        </div>
        <div>
          <p className="channel-row__label">Live Minutes</p>
          <p className="channel-row__value">{liveMinutes.toLocaleString()}</p>
        </div>
      </div>
      <span className={clsx("channel-row__status", `is-${status}`)}>
        {statusLabels[status]}
      </span>
    </div>
  );
};

export default ChannelRow;
