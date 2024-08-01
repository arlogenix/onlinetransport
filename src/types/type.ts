export type SERVICE = 'train' | 'flight' | 'bus'

export type MATCH_STATION_RESPONSE = {
  "session_id": string;
  "provider": string;
  "start_station_id": number;
  "start_station_name": string;
  "start_latitude": number;
  "start_longitude": number;
  "end_station_id": number;
  "end_station_name": string;
  "end_latitude": number;
  "end_longitude": number;
}