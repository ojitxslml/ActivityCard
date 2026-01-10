export class CardConfigDto {
  username: string;
  theme?: string = 'default';
  hide_border?: boolean = false;
  show_icons?: boolean = true;
  hide_rank?: boolean = false;
  include_all_commits?: boolean = true;
  count_private?: boolean = false;
  hide?: string = '';
  custom_title?: string;
  bg_color?: string;
  title_color?: string;
  text_color?: string;
  icon_color?: string;
  border_color?: string;
}
