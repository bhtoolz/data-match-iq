export interface SampleRecord {
  'External ID': string;
  'Unit Number': string;
  'Street Number': string;
  'Street Name': string;
  'Street Type': string;
  'Suburb': string;
  'State': string;
  'Postcode': string;
  'Source': string;
  'Notes': string;
}

export const SAMPLE_CSV_CONTENT = `External ID,Unit Number,Street Number,Street Name,Street Type,Suburb,State,Postcode,Source,Notes
REC-101,4,12,The Esplanade,Esp,Surfers Paradise,QLD,4217,RP Data,Owner occupied oceanfront
REC-102,,45,Campbell,Pde,Bondi Beach,NSW,2026,PriceFinder,High interest vendor
REC-103,12,108,Ocean,St,Clovelly,NSW,2031,CoreLogic,Downsizer candidate
REC-104,,88,Wolseley,Rd,Point Piper,NSW,2027,Domain List,Waterfront prestige
REC-105,2A,15,Raglan,St,Manly,NSW,2095,RP Data,Doctor / investor
REC-106,,24-26,Crown,St,Surry Hills,NSW,2010,Agent Box Sync,Commercial terrace
REC-107,,14,Hopetoun,Ave,Mosman,NSW,2088,PriceFinder,Family home
REC-108,8,34,Marine,Pde,Cottesloe,WA,6011,CoreLogic,WA luxury client
REC-109,,52,Kooyong,Rd,Toorak,VIC,3142,RP Data,Melbourne portfolio
REC-110,5,22,Moray,St,New Farm,QLD,4005,Domain List,Riverfront apartment
REC-111,,17,Glenmore,Rd,Paddington,NSW,2021,PriceFinder,Heritage terrace
REC-112,3,40,Church,St,Brighton,VIC,3186,RP Data,Bayside downsizer
REC-113,,102,George,St,Parramatta,NSW,2150,CoreLogic,Commercial investor
REC-114,,67,Victoria,Ave,Albert Park,VIC,3206,Domain List,Victorian residence
REC-115,14,88,Kurraba,Rd,Neutral Bay,NSW,2089,RP Data,Harbour view unit
REC-116,,93,Hastings,St,Noosa Heads,QLD,4567,PriceFinder,Holiday home owner
REC-117,,5,The Crescent,Cres,Manly,NSW,2095,CoreLogic,Local resident
REC-118,7,19,Macleay,St,Potts Point,NSW,2011,RP Data,Penthouse level
REC-119,,150,Queen,St,Woollahra,NSW,,PriceFinder,Missing postcode warning row
REC-120,,33,Broadwater,Ave,Maroochydore,XX,4558,CoreLogic,Unrecognised state test
REC-121,,88,Wolseley,Rd,Point Piper,NSW,2027,Domain List,Duplicate record test
REC-122,,,,,,,,Manual Lead,Unparseable row test
`;

export function downloadSampleCSV(): void {
  const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'data_match_iq_sample_property_list.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
