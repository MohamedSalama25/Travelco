import { InboxIcon } from 'lucide-react';

interface NoDataMsgProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  additionalMessage?: string;
  iconBgColor?: string;
  iconColor?: string;
}

const NoDataMsg = ({
  icon: Icon = InboxIcon,
  title = 'No data found',
  description = 'There is no data to display at the moment',
  additionalMessage = 'Check back later for updates',
  iconBgColor = 'bg-surface',
  iconColor = 'text-primary'
}: NoDataMsgProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
      <div className={`w-32 h-32 ${iconBgColor} rounded-full flex items-center justify-center`}>
        <Icon className={`w-16 h-16 ${iconColor}`} />
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-lg max-w-md">
          {description}
        </p>
      </div>
      {additionalMessage && (
        <div className="text-sm text-muted-foreground">
          {additionalMessage}
        </div>
      )}
    </div>
  );
};

export default NoDataMsg;