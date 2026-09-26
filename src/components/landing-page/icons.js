// landing-page/icons.js
import React from 'react';

// Filled Material Design Icons (SVG components)
import { ReactComponent as Chat } from '@material-design-icons/svg/filled/chat.svg';
import { ReactComponent as Style } from '@material-design-icons/svg/filled/style.svg';
import { ReactComponent as Quiz } from '@material-design-icons/svg/filled/quiz.svg';
import { ReactComponent as Insights } from '@material-design-icons/svg/filled/insights.svg';
import { ReactComponent as Tune } from '@material-design-icons/svg/filled/tune.svg';
import { ReactComponent as Public } from '@material-design-icons/svg/filled/public.svg';
import { ReactComponent as MenuBook } from '@material-design-icons/svg/filled/menu_book.svg';
import { ReactComponent as School } from '@material-design-icons/svg/filled/school.svg';
import { ReactComponent as Forum } from '@material-design-icons/svg/filled/forum.svg';
import { ReactComponent as Description } from '@material-design-icons/svg/filled/description.svg';
import { ReactComponent as AttachMoney } from '@material-design-icons/svg/filled/attach_money.svg';
import { ReactComponent as Calculate } from '@material-design-icons/svg/filled/calculate.svg';
import { ReactComponent as Bolt } from '@material-design-icons/svg/filled/bolt.svg';
import { ReactComponent as DarkMode } from '@material-design-icons/svg/filled/dark_mode.svg';
import { ReactComponent as GpsFixed } from '@material-design-icons/svg/filled/gps_fixed.svg';
import { ReactComponent as AllInclusive } from '@material-design-icons/svg/filled/all_inclusive.svg';
import { ReactComponent as Block } from '@material-design-icons/svg/filled/block.svg';
import { ReactComponent as Favorite } from '@material-design-icons/svg/filled/favorite.svg';
import { ReactComponent as Diamond } from '@material-design-icons/svg/filled/diamond.svg';
import { ReactComponent as PlayArrow } from '@material-design-icons/svg/filled/play_arrow.svg';
import { ReactComponent as PlayCircle } from '@material-design-icons/svg/filled/play_circle.svg';
import { ReactComponent as Stop } from '@material-design-icons/svg/filled/stop.svg';
import { ReactComponent as VolumeUp } from '@material-design-icons/svg/filled/volume_up.svg';
import { ReactComponent as VolumeOff } from '@material-design-icons/svg/filled/volume_off.svg';
import { ReactComponent as ArrowDropDown } from '@material-design-icons/svg/filled/arrow_drop_down.svg';
import { ReactComponent as Check } from '@material-design-icons/svg/filled/check.svg';
import { ReactComponent as Language } from '@material-design-icons/svg/filled/language.svg';
import { ReactComponent as Translate } from '@material-design-icons/svg/filled/translate.svg';
import { ReactComponent as Settings } from '@material-design-icons/svg/filled/settings.svg';
import { ReactComponent as HourglassEmpty } from '@material-design-icons/svg/filled/hourglass_empty.svg';
import { ReactComponent as ArrowBack } from '@material-design-icons/svg/filled/arrow_back.svg';
import { ReactComponent as Time } from '@material-design-icons/svg/filled/timer.svg';
import { ReactComponent as Spellcheck } from '@material-design-icons/svg/filled/spellcheck.svg';
import { ReactComponent as EmojiEvents } from '@material-design-icons/svg/filled/emoji_events.svg';
import { ReactComponent as ExpandLess } from '@material-design-icons/svg/filled/expand_less.svg';
import { ReactComponent as ExpandMore } from '@material-design-icons/svg/filled/expand_more.svg';
import { ReactComponent as Close } from '@material-design-icons/svg/filled/close.svg';

// Name-based lookup
export const ICONS = {
  Chat,
  Style,
  Quiz,
  Insights,
  Tune,
  Public,
  MenuBook,
  School,
  Forum,
  Description,
  AttachMoney,
  Calculate,
  Bolt,
  DarkMode,
  GpsFixed,
  AllInclusive,
  Block,
  Favorite,
  Diamond,
  PlayArrow,
  PlayCircle,
  Stop,
  VolumeUp,
  VolumeOff,
  ArrowDropDown,
  Check,
  Language,
  Translate,
  Settings,
  HourglassEmpty,
  ArrowBack,
  Time,
  Spellcheck,
  EmojiEvents,
  ExpandLess,
  ExpandMore,
  Close,
};

/**
 * Renders a Material icon by name.
 *
 * @example
 *   <MaterialIcon name="Chat" size={32} color="#000" />
 */
export const MaterialIcon = ({ name, size = 24, color = 'currentColor', style = {} }) => {
  const Icon = ICONS[name];
  if (!Icon) {
    console.warn(`MaterialIcon: "${name}" not found`);
    return null;
  }
  return (
    <Icon
      style={{
        width: size,
        height: size,
        fill: color,
        display: 'block',
        ...style,
      }}
    />
  );
};