export interface Country {
  id: string;
  name: string;
  iso_code: string;
}

export interface CreateCountryDTO {
  name: string;
  iso_code: string;
}
