import clsx from "clsx";
import { StatCard as StatCardType } from "../data/types";

const StatCard = ({ label, value, delta, helper }: StatCardType) => {
  const isPositive = delta.startsWith("+");

  return (
    <article className="stat-card">
      <div className="stat-card__header">
        <p className="stat-card__label">{label}</p>
        <span className={clsx("stat-card__delta", isPositive && "is-positive")}>
          {delta}
        </span>
      </div>
      <h3 className="stat-card__value">{value}</h3>
      <p className="stat-card__helper">{helper}</p>
    </article>
  );
};

export default StatCard;
