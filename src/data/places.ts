/**
 * Place-of-birth database: name | region | country | lat | lon | IANA timezone.
 * Not exhaustive — the Kundli form has an "advanced" mode to enter exact
 * coordinates + timezone for any place on earth.
 */
export interface Place {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz: string;
}

const IN = "Asia/Kolkata";

/** name|region|lat|lon — all India (Asia/Kolkata) */
const INDIA = `
Srinagar|Jammu & Kashmir|34.08|74.80|Jammu|Jammu & Kashmir|32.73|74.87|Leh|Ladakh|34.15|77.58
Amritsar|Punjab|31.63|74.87|Ludhiana|Punjab|30.90|75.86|Jalandhar|Punjab|31.33|75.58|Patiala|Punjab|30.34|76.39|Bathinda|Punjab|30.15|74.95|Chandigarh|Chandigarh|30.73|76.78
Dehradun|Uttarakhand|30.32|78.03|Haridwar|Uttarakhand|29.95|78.16|Rishikesh|Uttarakhand|30.09|78.27|Nainital|Uttarakhand|29.39|79.46
Shimla|Himachal|31.10|77.17|Mandi|Himachal|31.70|76.93|Dharamshala|Himachal|32.22|76.32
Chennai|Tamil Nadu|13.08|80.27|Coimbatore|Tamil Nadu|11.02|76.96|Madurai|Tamil Nadu|9.93|78.12|Trichy|Tamil Nadu|10.79|78.70|Salem|Tamil Nadu|11.66|78.15|Kanyakumari|Tamil Nadu|8.08|77.54|Tirunelveli|Tamil Nadu|8.71|77.76|Vellore|Tamil Nadu|12.92|79.13|Thanjavur|Tamil Nadu|10.79|79.14
Bengaluru|Karnataka|12.97|77.59|Mysuru|Karnataka|12.30|76.65|Hubballi|Karnataka|15.36|75.13|Mangaluru|Karnataka|12.91|74.85|Belagavi|Karnataka|15.85|74.50|Shivamogga|Karnataka|13.93|75.57|Kalaburagi|Karnataka|17.33|76.83|Dharwad|Karnataka|15.46|75.01|Udupi|Karnataka|13.34|74.75|Ballari|Karnataka|15.14|76.83|Tumakuru|Karnataka|13.34|77.10|Hassan|Karnataka|13.00|76.10
Hyderabad|Telangana|17.38|78.48|Warangal|Telangana|17.98|79.59|Nizamabad|Telangana|18.67|78.09
Visakhapatnam|Andhra Pradesh|17.69|83.21|Vijayawada|Andhra Pradesh|16.51|80.65|Guntur|Andhra Pradesh|16.31|79.44|Tirupati|Andhra Pradesh|13.63|79.42|Rajahmundry|Andhra Pradesh|16.99|81.77|Kurnool|Andhra Pradesh|15.83|78.04|Nellore|Andhra Pradesh|14.44|79.99
Kochi|Kerala|9.93|76.27|Thiruvananthapuram|Kerala|8.52|76.94|Kozhikode|Kerala|11.25|75.78|Thrissur|Kerala|10.52|76.21|Kannur|Kerala|11.87|75.36|Alappuzha|Kerala|9.50|76.34|Kollam|Kerala|8.89|76.60|Palakkad|Kerala|10.79|76.65|Idukki|Kerala|9.83|76.97
Bhubaneswar|Odisha|20.30|85.82|Cuttack|Odisha|20.46|85.88|Rourkela|Odisha|22.26|84.87|Puri|Odisha|19.81|85.83|Sambalpur|Odisha|21.46|83.98
Patna|Bihar|25.61|85.12|Gaya|Bihar|24.79|85.00|Muzaffarpur|Bihar|26.12|85.39|Bhagalpur|Bihar|25.24|86.98|Darbhanga|Bihar|26.15|85.90
Ranchi|Jharkhand|23.34|85.33|Jamshedpur|Jharkhand|22.80|86.20|Dhanbad|Jharkhand|23.79|86.42
Kolkata|West Bengal|22.57|88.36|Howrah|West Bengal|22.58|88.31|Durgapur|West Bengal|23.52|87.32|Asansol|West Bengal|23.69|86.98|Siliguri|West Bengal|26.73|88.45|Kolkata City|West Bengal|22.55|88.34
Guwahati|Assam|26.14|91.74|Dibrugarh|Assam|27.47|94.91|Jorhat|Assam|26.75|94.21|Silchar|Assam|24.82|92.79
Shillong|Meghalaya|25.57|91.88|Imphal|Manipur|24.82|93.94|Aizawl|Mizoram|23.73|92.72|Kohima|Nagaland|25.67|94.11|Agartala|Tripura|23.83|91.28|Gangtok|Sikkim|27.33|88.61|Itanagar|Arunachal|27.08|93.62
Jaipur|Rajasthan|26.91|75.79|Jodhpur|Rajasthan|26.24|73.02|Udaipur|Rajasthan|24.58|73.71|Kota|Rajasthan|25.21|75.86|Ajmer|Rajasthan|26.45|74.64|Bikaner|Rajasthan|28.02|73.22|Jaisalmer|Rajasthan|26.91|70.90|Mount Abu|Rajasthan|24.59|72.71|Bharatpur|Rajasthan|27.21|77.49|Alwar|Rajasthan|27.57|76.61
Lucknow|Uttar Pradesh|26.85|80.95|Kanpur|Uttar Pradesh|26.45|80.33|Varanasi|Uttar Pradesh|25.32|82.99|Agra|Uttar Pradesh|27.18|78.01|Prayagraj|Uttar Pradesh|25.44|81.85|Noida|Uttar Pradesh|28.54|77.39|Gurugram|Haryana|28.46|77.03|Faridabad|Haryana|28.41|77.32|Rohtak|Haryana|28.90|76.09|Hisar|Haryana|29.15|75.72
Delhi|Delhi|28.61|77.21|New Delhi|Delhi|28.61|77.23
Indore|Madhya Pradesh|22.72|75.86|Bhopal|Madhya Pradesh|23.26|77.41|Jabalpur|Madhya Pradesh|23.18|79.95|Gwalior|Madhya Pradesh|26.22|78.18|Ujjain|Madhya Pradesh|23.18|75.78|Khajuraho|Madhya Pradesh|24.85|79.92|Rewa|Madhya Pradesh|24.53|81.29|Sagar|Madhya Pradesh|23.83|78.80
Mumbai|Maharashtra|19.08|72.88|Pune|Maharashtra|18.52|73.86|Nagpur|Maharashtra|21.15|79.09|Nashik|Maharashtra|20.00|73.79|Thane|Maharashtra|19.19|72.98|Aurangabad|Maharashtra|19.88|75.34|Solapur|Maharashtra|17.66|75.91|Kolhapur|Maharashtra|16.70|74.24|Amravati|Maharashtra|20.93|77.75|Jalgaon|Maharashtra|21.01|75.56|Mumbai Suburbs|Maharashtra|19.12|72.85|Shirdi|Maharashtra|19.76|74.48|Mahabaleshwar|Maharashtra|17.93|73.65|Alibag|Maharashtra|18.64|72.87
Surat|Gujarat|21.17|72.83|Ahmedabad|Gujarat|23.02|72.57|Vadodara|Gujarat|22.31|73.18|Rajkot|Gujarat|22.30|70.79|Bhavnagar|Gujarat|21.77|72.15|Jamnagar|Gujarat|22.47|70.07|Gandhinagar|Gujarat|23.22|72.65|Dwarka|Gujarat|22.24|68.97|Somnath|Gujarat|20.89|70.40|Bhuj|Gujarat|23.24|69.67|Anand|Gujarat|22.56|72.91
Panaji|Goa|15.49|73.82|Margao|Goa|15.27|73.97|Mapusa|Goa|15.60|73.81
Raipur|Chhattisgarh|21.25|81.63|Bilaspur|Chhattisgarh|22.08|82.15
Chandigarh|Chandigarh|30.73|76.78|Daman|Dadra & Nagar Haveli|20.41|72.85|Port Blair|Andaman & Nicobar|11.62|92.72
`;

/** name|country|lat|lon|tz */
const WORLD = `
Karachi|Pakistan|24.86|67.01|Asia/Karachi|Lahore|Pakistan|31.55|74.34|Asia/Karachi|Islamabad|Pakistan|33.69|73.04|Asia/Karachi|Peshawar|Pakistan|34.01|71.58|Asia/Karachi|Quetta|Pakistan|30.18|66.99|Asia/Karachi
Dhaka|Bangladesh|23.81|90.41|Asia/Dhaka|Chattogram|Bangladesh|22.36|91.78|Asia/Dhaka|Sylhet|Bangladesh|24.89|91.87|Asia/Dhaka
Kathmandu|Nepal|27.70|85.32|Asia/Kathmandu|Pokhara|Nepal|28.21|83.99|Asia/Kathmandu|Lumbini|Nepal|27.47|83.28|Asia/Kathmandu
Colombo|Sri Lanka|6.93|79.85|Asia/Colombo|Jaffna|Sri Lanka|9.66|80.02|Asia/Colombo
Dubai|UAE|25.20|55.27|Asia/Dubai|Abu Dhabi|UAE|24.45|54.38|Asia/Dubai|Sharjah|UAE|25.35|55.40|Asia/Dubai|Riyadh|Saudi Arabia|24.71|46.68|Asia/Riyadh|Jeddah|Saudi Arabia|21.49|39.19|Asia/Riyadh|Makkah|Saudi Arabia|21.42|39.83|Asia/Riyadh|Madinah|Saudi Arabia|24.47|39.61|Asia/Riyadh|Doha|Qatar|25.29|51.53|Asia/Qatar|Abu Dhabi|UAE|24.45|54.38|Asia/Dubai|Kuwait City|Kuwait|29.38|47.99|Asia/Kuwait|Manama|Bahrain|26.23|50.59|Asia/Bahrain|Muscat|Oman|23.59|58.55|Asia/Muscat|Tehran|Iran|35.69|51.39|Asia/Tehran|Baghdad|Iraq|33.31|44.37|Asia/Baghdad|Istanbul|Türkiye|41.01|28.98|Europe/Istanbul|Jerusalem|Israel|31.77|35.21|Asia/Jerusalem|Tel Aviv|Israel|32.08|34.78|Asia/Jerusalem|Amman|Jordan|31.95|35.93|Asia/Amman|Beirut|Lebanon|33.89|35.50|Asia/Beirut|Cairo|Egypt|30.04|31.24|Africa/Cairo|Alexandria|Egypt|31.20|29.92|Africa/Cairo|Lagos|Nigeria|6.52|3.38|Africa/Lagos|Accra|Ghana|5.60|0.19|Africa/Accra|Nairobi|Kenya|-1.29|36.82|Africa/Nairobi|Kampala|Uganda|0.35|32.58|Africa/Kampala|Dar es Salaam|Tanzania|-6.82|39.28|Africa/Dar_es_Salaam|Addis Ababa|Ethiopia|9.03|38.74|Africa/Addis_Ababa|Johannesburg|South Africa|-26.20|28.05|Africa/Johannesburg|Cape Town|South Africa|-33.92|18.42|Africa/Johannesburg|Durban|South Africa|-29.86|31.02|Africa/Johannesburg|Pretoria|South Africa|-25.75|28.19|Africa/Johannesburg|Gaborone|Botswana|-24.65|25.91|Africa/Gaborone|Windhoek|Namibia|-22.56|17.08|Africa/Windhoek|Harare|Zimbabwe|-17.83|31.05|Africa/Harare|Lusaka|Zambia|-15.41|28.29|Africa/Lusaka|Casablanca|Morocco|33.57|-7.59|Africa/Casablanca|Tunis|Tunisia|36.80|10.18|Africa/Tunis|Algiers|Algeria|36.75|3.06|Africa/Algiers
London|United Kingdom|51.51|-0.13|Europe/London|Birmingham|United Kingdom|52.48|-1.89|Europe/London|Manchester|United Kingdom|53.48|-2.24|Europe/London|Glasgow|United Kingdom|55.86|-4.25|Europe/London|Leicester|United Kingdom|52.64|-1.13|Europe/London|Cardiff|United Kingdom|51.48|-3.18|Europe/London|Dublin|Ireland|53.35|-6.26|Europe/Dublin|Belfast|United Kingdom|54.60|-5.93|Europe/London
New York|United States|40.71|-74.01|America/New_York|Jersey City|United States|40.73|-74.07|America/New_York|Newark|United States|40.74|-74.17|America/New_York|Boston|United States|42.36|-71.06|America/New_York|Philadelphia|United States|39.95|-75.17|America/New_York|Washington DC|United States|38.91|-77.04|America/New_York|Atlanta|United States|33.75|-84.39|America/New_York|Miami|United States|25.76|-80.19|America/New_York|Orlando|United States|28.54|-81.38|America/New_York|Chicago|United States|41.88|-87.63|America/Chicago|Houston|United States|29.76|-95.37|America/Chicago|Dallas|United States|32.78|-96.80|America/Chicago|Austin|United States|30.27|-97.74|America/Chicago|Denver|United States|39.74|-104.99|America/Denver|Minneapolis|United States|44.98|-93.27|America/Chicago|Detroit|United States|42.33|-83.05|America/Detroit|Saint Louis|United States|38.63|-90.20|America/Chicago|Los Angeles|United States|34.05|-118.24|America/Los_Angeles|San Francisco|United States|37.77|-122.42|America/Los_Angeles|San Jose|United States|37.34|-121.89|America/Los_Angeles|San Diego|United States|32.72|-117.16|America/Los_Angeles|Seattle|United States|47.61|-122.33|America/Los_Angeles|Portland|United States|45.52|-122.68|America/Los_Angeles|Las Vegas|United States|36.17|-115.14|America/Los_Angeles|Phoenix|United States|33.45|-112.07|America/Phoenix|Salt Lake City|United States|40.76|-111.89|America/Denver|Honolulu|United States|21.31|-157.86|Pacific/Honolulu|Anchorage|United States|61.22|-149.90|America/Anchorage|Fairbanks|United States|64.84|-147.72|America/Anchorage
Toronto|Canada|43.65|-79.38|America/Toronto|Montreal|Canada|45.50|-73.57|America/Toronto|Ottawa|Canada|45.42|-75.70|America/Toronto|Vancouver|Canada|49.28|-123.12|America/Vancouver|Calgary|Canada|51.05|-114.07|America/Edmonton|Edmonton|Canada|53.55|-113.49|America/Edmonton|Winnipeg|Canada|49.90|-97.14|America/Winnipeg|Halifax|Canada|44.65|-63.58|America/Halifax
Mexico City|Mexico|19.43|-99.13|America/Mexico_City|Guadalajara|Mexico|20.67|-103.35|America/Mexico_City|Monterrey|Mexico|25.69|-100.32|America/Monterrey|Baja California|Mexico|32.51|-117.03|America/Tijuana
Panama City|Panama|8.98|-79.52|America/Panama|San Jose|Costa Rica|9.93|-84.08|America/Costa_Rica|Guatemala City|Guatemala|14.63|-90.51|America/Guatemala|Havana|Cuba|23.11|-82.37|America/Havana|Port of Spain|Trinidad and Tobago|10.65|-61.50|America/Port_of_Spain|Kingston|Jamaica|17.97|-76.79|America/Jamaica|Nassau|Bahamas|25.06|-77.34|America/Nassau|Bridgetown|Barbados|13.10|-59.62|America/Barbados
Bogota|Colombia|4.71|-74.07|America/Bogota|Caracas|Venezuela|10.48|-66.90|America/Caracas|Quito|Ecuador|-0.18|-78.47|America/Guayaquil|Lima|Peru|-12.05|-77.04|America/Lima|Santiago|Chile|-33.45|-70.66|America/Santiago|Buenos Aires|Argentina|-34.60|-58.38|America/Argentina/Buenos_Aires|Cordoba|Argentina|-31.42|-64.18|America/Argentina/Cordoba|Sao Paulo|Brazil|-23.55|-46.63|America/Sao_Paulo|Rio de Janeiro|Brazil|-22.91|-43.17|America/Sao_Paulo|Brasilia|Brazil|-15.79|-47.88|America/Sao_Paulo|Montevideo|Uruguay|-34.90|-56.16|America/Montevideo|Asuncion|Paraguay|-25.26|-57.58|America/Asuncion|La Paz|Bolivia|-16.50|-68.15|America/La_Paz|Georgetown|Guyana|6.80|-58.16|America/Guyana|Paramaribo|Suriname|5.85|-55.20|America/Paramaribo|Port of Spain|Trinidad and Tobago|10.65|-61.50|America/Port_of_Spain
Singapore|Singapore|1.35|103.82|Asia/Singapore|Kuala Lumpur|Malaysia|3.14|101.69|Asia/Kuala_Lumpur|George Town|Malaysia|5.41|100.33|Asia/Kuala_Lumpur|Johor Bahru|Malaysia|1.49|103.74|Asia/Kuala_Lumpur|Jakarta|Indonesia|-6.21|106.85|Asia/Jakarta|Surabaya|Indonesia|-7.26|112.75|Asia/Jakarta|Denpasar|Indonesia|-8.65|115.22|Asia/Makassar|Manila|Philippines|14.60|120.98|Asia/Manila|Cebu|Philippines|10.32|123.90|Asia/Manila|Bangkok|Thailand|13.76|100.50|Asia/Bangkok|Phuket|Thailand|7.89|98.40|Asia/Bangkok|Chiang Mai|Thailand|18.79|98.98|Asia/Bangkok|Pattaya|Thailand|12.92|100.88|Asia/Bangkok|Ho Chi Minh City|Vietnam|10.82|106.63|Asia/Ho_Chi_Minh|Hanoi|Vietnam|21.03|105.85|Asia/Ho_Chi_Minh|Phnom Penh|Cambodia|11.56|104.92|Asia/Phnom_Penh|Siem Reap|Cambodia|13.36|103.86|Asia/Phnom_Penh|Vientiane|Laos|17.97|102.63|Asia/Vientiane|Yangon|Myanmar|16.87|96.20|Asia/Yangon|Mandalay|Myanmar|21.98|96.08|Asia/Yangon|Dhaka|Bangladesh|23.81|90.41|Asia/Dhaka|Hong Kong|Hong Kong SAR|22.32|114.17|Asia/Hong_Kong|Macao|Macao SAR|22.20|113.54|Asia/Macau|Taipei|Taiwan|25.03|121.57|Asia/Taipei|Seoul|South Korea|37.57|126.98|Asia/Seoul|Busan|South Korea|35.18|129.08|Asia/Seoul|Tokyo|Japan|35.68|139.69|Asia/Tokyo|Yokohama|Japan|35.44|139.64|Asia/Tokyo|Osaka|Japan|34.69|135.50|Asia/Tokyo|Kyoto|Japan|35.01|135.77|Asia/Tokyo|Nagoya|Japan|35.18|136.91|Asia/Tokyo|Sapporo|Japan|43.06|141.35|Asia/Tokyo|Fukuoka|Japan|33.59|130.40|Asia/Tokyo|Beijing|China|39.90|116.41|Asia/Shanghai|Shanghai|China|31.23|121.47|Asia/Shanghai|Guangzhou|China|23.13|113.26|Asia/Shanghai|Shenzhen|China|22.54|114.06|Asia/Shanghai|Chengdu|China|30.57|104.07|Asia/Shanghai|Lhasa|China|29.65|91.14|Asia/Shanghai|Urumqi|China|43.83|87.62|Asia/Urumqi|Kathmandu|Nepal|27.70|85.32|Asia/Kathmandu|Thimphu|Bhutan|27.47|89.64|Asia/Thimphu|Dushanbe|Tajikistan|38.56|68.79|Asia/Dushanbe|Tashkent|Uzbekistan|41.30|69.24|Asia/Tashkent|Almaty|Kazakhstan|43.24|76.89|Asia/Almaty|Bishkek|Kyrgyzstan|42.87|74.59|Asia/Bishkek|Ashgabat|Turkmenistan|37.95|58.38|Asia/Ashgabat|Baku|Azerbaijan|40.41|49.87|Asia/Baku|Tbilisi|Georgia|41.72|44.79|Asia/Tbilisi|Yerevan|Armenia|40.18|44.51|Asia/Yerevan|Moscow|Russia|55.76|37.62|Europe/Moscow|Saint Petersburg|Russia|59.94|30.31|Europe/Moscow|Novosibirsk|Russia|55.01|82.93|Asia/Novosibirsk|Vladivostok|Russia|43.12|131.89|Asia/Vladivostok|Yekaterinburg|Russia|56.84|60.65|Asia/Yekaterinburg
Paris|France|48.86|2.35|Europe/Paris|Marseille|France|43.30|5.37|Europe/Paris|Lyon|France|45.76|4.84|Europe/Paris|Nice|France|43.71|7.27|Europe/Paris|Toulouse|France|43.60|1.44|Europe/Paris|Berlin|Germany|52.52|13.40|Europe/Berlin|Hamburg|Germany|53.55|9.99|Europe/Berlin|Munich|Germany|48.14|11.58|Europe/Berlin|Frankfurt|Germany|50.11|8.68|Europe/Berlin|Cologne|Germany|50.94|6.96|Europe/Berlin|Amsterdam|Netherlands|52.37|4.90|Europe/Amsterdam|Rotterdam|Netherlands|51.92|4.48|Europe/Amsterdam|Brussels|Belgium|50.85|4.35|Europe/Brussels|Antwerp|Belgium|51.22|4.40|Europe/Brussels|Luxembourg|Luxembourg|49.61|6.13|Europe/Luxembourg|Vienna|Austria|48.21|16.37|Europe/Vienna|Salzburg|Austria|47.80|13.04|Europe/Vienna|Zurich|Switzerland|47.38|8.54|Europe/Zurich|Geneva|Switzerland|46.20|6.14|Europe/Zurich|Bern|Switzerland|46.95|7.45|Europe/Zurich|Milan|Italy|45.46|9.19|Europe/Rome|Rome|Italy|41.90|12.50|Europe/Rome|Naples|Italy|40.85|14.27|Europe/Rome|Venice|Italy|45.44|12.32|Europe/Rome|Florence|Italy|43.77|11.26|Europe/Rome|Madrid|Spain|40.42|-3.70|Europe/Madrid|Barcelona|Spain|41.39|2.17|Europe/Madrid|Valencia|Spain|39.47|-0.38|Europe/Madrid|Seville|Spain|37.39|-5.98|Europe/Madrid|Lisbon|Portugal|38.72|-9.14|Europe/Lisbon|Porto|Portugal|41.15|-8.61|Europe/Lisbon|Athens|Greece|37.98|23.73|Europe/Athens|Thessaloniki|Greece|40.64|22.94|Europe/Athens|Rome|Italy|41.90|12.50|Europe/Rome|Valletta|Malta|35.90|14.51|Europe/Malta|Nicosia|Cyprus|35.19|33.38|Asia/Nicosia|Warsaw|Poland|52.23|21.01|Europe/Warsaw|Krakow|Poland|50.06|19.94|Europe/Warsaw|Prague|Czechia|50.08|14.44|Europe/Prague|Bratislava|Slovakia|48.15|17.11|Europe/Bratislava|Budapest|Hungary|47.50|19.04|Europe/Budapest|Bucharest|Romania|44.43|26.10|Europe/Bucharest|Sofia|Bulgaria|42.70|23.32|Europe/Sofia|Belgrade|Serbia|44.79|20.47|Europe/Belgrade|Zagreb|Croatia|45.81|15.98|Europe/Zagreb|Ljubljana|Slovenia|46.06|14.51|Europe/Ljubljana|Sarajevo|Bosnia|43.86|18.41|Europe/Sarajevo|Skopje|North Macedonia|42.00|21.43|Europe/Skopje|Tirana|Albania|41.33|19.82|Europe/Tirane|Kyiv|Ukraine|50.45|30.52|Europe/Kyiv|Odesa|Ukraine|46.48|30.73|Europe/Kyiv|Kharkiv|Ukraine|49.99|36.23|Europe/Kyiv|Minsk|Belarus|53.90|27.57|Europe/Minsk|Vilnius|Lithuania|54.69|25.28|Europe/Vilnius|Riga|Latvia|56.95|24.11|Europe/Riga|Tallinn|Estonia|59.44|24.75|Europe/Tallinn|Helsinki|Finland|60.17|24.94|Europe/Helsinki|Stockholm|Sweden|59.33|18.07|Europe/Stockholm|Gothenburg|Sweden|57.71|11.97|Europe/Stockholm|Oslo|Norway|59.91|10.75|Europe/Oslo|Bergen|Norway|60.39|5.32|Europe/Oslo|Copenhagen|Denmark|55.68|12.57|Europe/Copenhagen|Reykjavik|Iceland|64.15|-21.94|Atlantic/Reykjavik|Newcastle|United Kingdom|54.98|-1.61|Europe/London|Edinburgh|United Kingdom|55.95|-3.19|Europe/London|Liverpool|United Kingdom|53.41|-2.99|Europe/London|Sheffield|United Kingdom|53.38|-1.47|Europe/London|Southampton|United Kingdom|50.90|-1.40|Europe/London|Nottingham|United Kingdom|52.95|-1.15|Europe/London|Cambridge|United Kingdom|52.20|0.12|Europe/London|Oxford|United Kingdom|51.75|-1.26|Europe/London|Bristol|United Kingdom|51.45|-2.59|Europe/London|Leeds|United Kingdom|53.80|-1.55|Europe/London
Sydney|Australia|-33.87|151.21|Australia/Sydney|Melbourne|Australia|-37.81|144.96|Australia/Melbourne|Brisbane|Australia|-27.47|153.03|Australia/Brisbane|Perth|Australia|-31.95|115.86|Australia/Perth|Adelaide|Australia|-34.93|138.60|Australia/Adelaide|Canberra|Australia|-35.28|149.13|Australia/Sydney|Gold Coast|Australia|-28.02|153.43|Australia/Brisbane|Darwin|Australia|-12.46|130.84|Australia/Darwin|Hobart|Australia|-42.88|147.33|Australia/Hobart|Auckland|New Zealand|-36.85|174.76|Pacific/Auckland|Wellington|New Zealand|-41.29|174.78|Pacific/Auckland|Christchurch|New Zealand|-43.53|172.64|Pacific/Auckland|Suva|Fiji|-18.14|178.44|Pacific/Fiji|Apia|Samoa|-13.83|-171.77|Pacific/Apia|Nuku'alofa|Tonga|-21.14|-175.20|Pacific/Tongatapu
`;

const isNum = (t: string | undefined) =>
  t !== undefined && t !== "" && Number.isFinite(Number(t));

function tokens(src: string): string[] {
  return src
    .split(/[|\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** India stream: name | region | lat | lon — resyncs if a record is malformed. */
function parseIndia(src: string): Place[] {
  const toks = tokens(src);
  const out: Place[] = [];
  for (let i = 0; i < toks.length; ) {
    if (isNum(toks[i + 2]) && isNum(toks[i + 3])) {
      out.push({
        name: toks[i],
        region: toks[i + 1],
        country: "India",
        lat: Number(toks[i + 2]),
        lon: Number(toks[i + 3]),
        tz: IN,
      });
      i += 4;
    } else {
      i += 1;
    }
  }
  return out;
}

/** World stream: name | country | lat | lon | iana-zone — resyncs if malformed. */
function parseWorld(src: string): Place[] {
  const toks = tokens(src);
  const out: Place[] = [];
  for (let i = 0; i < toks.length; ) {
    const tz = toks[i + 4];
    if (
      isNum(toks[i + 2]) &&
      isNum(toks[i + 3]) &&
      typeof tz === "string" &&
      tz.includes("/") &&
      !isNum(toks[i])
    ) {
      out.push({
        name: toks[i],
        region: "",
        country: toks[i + 1],
        lat: Number(toks[i + 2]),
        lon: Number(toks[i + 3]),
        tz,
      });
      i += 5;
    } else {
      i += 1;
    }
  }
  return out;
}

function dedupe(list: Place[]): Place[] {
  const seen = new Map<string, Place>();
  for (const p of list) {
    const key = `${p.name.toLowerCase()}|${p.country}`;
    if (!seen.has(key)) seen.set(key, p);
  }
  return [...seen.values()];
}

export const PLACES: Place[] = dedupe([...parseIndia(INDIA), ...parseWorld(WORLD)]).sort((a, b) =>
  a.name.localeCompare(b.name),
);

export function searchPlaces(q: string, limit = 8): Place[] {
  const s = q.trim().toLowerCase();
  if (s.length < 1) return [];
  const starts: Place[] = [];
  const contains: Place[] = [];
  for (const p of PLACES) {
    const hay = `${p.name} ${p.region} ${p.country}`.toLowerCase();
    if (p.name.toLowerCase().startsWith(s)) starts.push(p);
    else if (hay.includes(s)) contains.push(p);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}

/** Guess the IANA zone for a coordinate (used only in manual/advanced mode). */
export function zoneForLon(lon: number): string {
  const off = Math.round(lon / 15);
  return `Etc/GMT${off === 0 ? "" : off > 0 ? `-${off}` : `+${-off}`}`;
}
