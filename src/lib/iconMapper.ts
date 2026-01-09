import { IconType } from 'react-icons';
import * as FaIcons from 'react-icons/fa';
import * as GiIcons from 'react-icons/gi';
import * as SiIcons from 'react-icons/si';
import { FaStar } from 'react-icons/fa';

const iconLibraries = {
  ...FaIcons,
  ...GiIcons,
  ...SiIcons,
};

export const getIconByName = (iconName?: string | null): IconType => {
  if (!iconName) return FaStar;
  
  const Icon = iconLibraries[iconName as keyof typeof iconLibraries];
  return Icon || FaStar;
};
