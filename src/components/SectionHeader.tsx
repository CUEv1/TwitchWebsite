type SectionHeaderProps = {
  title: string;
  description: string;
};

const SectionHeader = ({ title, description }: SectionHeaderProps) => {
  return (
    <header className="section-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
};

export default SectionHeader;
