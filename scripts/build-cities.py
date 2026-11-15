#!/usr/bin/env python3
"""Builds lib/astro/data/cities.json — the place list used by the birth-place picker.

Source: GeoNames (https://www.geonames.org, CC BY 4.0) via the `geonamescache` package.
Run:  pip install geonamescache && python3 scripts/build-cities.py

Output shape (kept compact because it is downloaded by the browser on demand):
  { "tz": [iana zone, ...], "rg": [region label, ...],
    "c":  [[name, regionIndex, lat, lon, tzIndex, "alias|alias"?], ...] }   # sorted by population, largest first
"""
import json, os, sys, unicodedata
import geonamescache

OUT = os.path.join(os.path.dirname(__file__), '..', 'lib', 'astro', 'data', 'cities.json')

IN_STATES = {
    '01': 'Andaman & Nicobar', '02': 'Andhra Pradesh', '03': 'Assam', '05': 'Chandigarh', '07': 'Delhi',
    '09': 'Gujarat', '10': 'Haryana', '11': 'Himachal Pradesh', '12': 'Jammu & Kashmir', '13': 'Kerala',
    '14': 'Lakshadweep', '16': 'Maharashtra', '17': 'Manipur', '18': 'Meghalaya', '19': 'Karnataka',
    '20': 'Nagaland', '21': 'Odisha', '22': 'Puducherry', '23': 'Punjab', '24': 'Rajasthan', '25': 'Tamil Nadu',
    '26': 'Tripura', '28': 'West Bengal', '29': 'Sikkim', '30': 'Arunachal Pradesh', '31': 'Mizoram', '33': 'Goa',
    '34': 'Bihar', '35': 'Madhya Pradesh', '36': 'Uttar Pradesh', '37': 'Chhattisgarh', '38': 'Jharkhand',
    '39': 'Uttarakhand', '40': 'Telangana', '41': 'Ladakh', '52': 'Dadra & Nagar Haveli and Daman & Diu',
}

# GeoNames still carries a few colonial-era or unusual spellings. (state code, GeoNames name) -> name people actually use.
RENAME = {
    ('19', 'Closepet'): 'Ramanagara', ('19', 'French Rocks'): 'Pandavapura', ('19', 'Robertsonpet'): 'Kolar Gold Fields',
    ('19', 'Chik Ballapur'): 'Chikkaballapur', ('19', 'Chikmagalur'): 'Chikkamagaluru', ('19', 'Tumkur'): 'Tumakuru',
    ('19', 'Davangere'): 'Davanagere', ('19', 'Shrirangapattana'): 'Srirangapatna', ('19', 'Chamrajnagar'): 'Chamarajanagar',
    ('19', 'Sagar'): 'Sagara', ('16', 'Sholapur'): 'Solapur', ('25', 'Teni'): 'Theni', ('33', 'Panjim'): 'Panaji',
}

# Older / alternative names people still type. alias -> (state code, final display name)
ALIASES = {
    'Bangalore': ('19', 'Bengaluru'), 'Mysore': ('19', 'Mysuru'), 'Mangalore': ('19', 'Mangaluru'),
    'Hubli': ('19', 'Hubballi'), 'Belgaum': ('19', 'Belagavi'), 'Gulbarga': ('19', 'Kalaburagi'),
    'Bellary': ('19', 'Ballari'), 'Bijapur': ('19', 'Vijayapura'), 'Shimoga': ('19', 'Shivamogga'),
    'Tumkur': ('19', 'Tumakuru'), 'Davangere': ('19', 'Davanagere'), 'Hospet': ('19', 'Hosapete'),
    'Chikmagalur': ('19', 'Chikkamagaluru'), 'Chikballapur': ('19', 'Chikkaballapur'),
    'Ramanagaram': ('19', 'Ramanagara'), 'KGF': ('19', 'Kolar Gold Fields'), 'Coorg': ('19', 'Madikeri'),
    'Kodagu': ('19', 'Madikeri'), 'Mercara': ('19', 'Madikeri'), 'Srirangapattana': ('19', 'Srirangapatna'),
    'Chamrajnagar': ('19', 'Chamarajanagar'), 'Sagar': ('19', 'Sagara'), 'Hubli-Dharwad': ('19', 'Hubballi'),
    'Bombay': ('16', 'Mumbai'), 'Poona': ('16', 'Pune'), 'Nasik': ('16', 'Nashik'), 'Sholapur': ('16', 'Solapur'),
    'Chhatrapati Sambhajinagar': ('16', 'Aurangabad'),
    'Madras': ('25', 'Chennai'), 'Trichy': ('25', 'Tiruchirappalli'), 'Tiruchi': ('25', 'Tiruchirappalli'),
    'Tanjore': ('25', 'Thanjavur'), 'Tuticorin': ('25', 'Thoothukudi'), 'Ooty': ('25', 'Ooty'), 'Teni': ('25', 'Theni'),
    'Calcutta': ('28', 'Kolkata'), 'Baroda': ('09', 'Vadodara'),
    'Benares': ('36', 'Varanasi'), 'Banaras': ('36', 'Varanasi'), 'Kashi': ('36', 'Varanasi'),
    'Allahabad': ('36', 'Prayagraj'), 'Cawnpore': ('36', 'Kanpur'),
    'Gurgaon': ('10', 'Gurugram'), 'Pondicherry': ('22', 'Puducherry'),
    'Trivandrum': ('13', 'Thiruvananthapuram'), 'Cochin': ('13', 'Kochi'), 'Ernakulam': ('13', 'Kochi'),
    'Calicut': ('13', 'Kozhikode'), 'Trichur': ('13', 'Thrissur'), 'Quilon': ('13', 'Kollam'),
    'Alleppey': ('13', 'Alappuzha'), 'Cannanore': ('13', 'Kannur'), 'Palghat': ('13', 'Palakkad'),
    'Vizag': ('02', 'Visakhapatnam'), 'Bezawada': ('02', 'Vijayawada'),
    'Simla': ('11', 'Shimla'), 'Gauhati': ('03', 'Guwahati'), 'Panjim': ('33', 'Panaji'), 'Goa': ('33', 'Panaji'), 'Margao': ('33', 'Madgaon'),
    'Bhubaneshwar': ('21', 'Bhubaneswar'), 'Jullundur': ('23', 'Jalandhar'), 'Bhatinda': ('23', 'Bathinda'),
}

# Towns that matter locally but are missing from the GeoNames >=15k extract. (name, state code, lat, lon, population-for-ranking)
EXTRA_IN = [
    ('Dharwad', '19', 15.4589, 75.0078, 204182),
    ('Sringeri', '19', 13.4198, 75.2567, 4253),
    ('Dharmasthala', '19', 12.9480, 75.3810, 10000),
    ('Kukke Subramanya', '19', 12.6636, 75.6160, 5000),
    ('Hampi', '19', 15.3350, 76.4600, 2800),
    ('Shravanabelagola', '19', 12.8580, 76.4880, 5000),
]

NEIGHBOURS = {'NP', 'LK', 'BD', 'PK', 'BT', 'MM', 'MV'}
DIASPORA = {'AE', 'SG', 'US', 'GB', 'CA', 'AU', 'MY', 'QA', 'KW', 'OM', 'BH', 'SA', 'NZ', 'DE', 'ZA', 'MU', 'FJ', 'KE', 'IE', 'NL'}


def ascii_name(s):
    s = ''.join(ch for ch in unicodedata.normalize('NFKD', s) if not unicodedata.combining(ch))
    return s.replace('\u2019', "'").strip()


def main():
    gc = geonamescache.GeonamesCache(min_city_population=15000)
    countries = {code: c['name'] for code, c in gc.get_countries().items()}
    capitals = {(code, ascii_name(c['capital'])) for code, c in gc.get_countries().items() if c.get('capital')}
    rows = []  # (population, name, region, lat, lon, tz, aliases)
    seen = set()
    for c in gc.get_cities().values():
        cc, pop = c['countrycode'], c['population']
        name = ascii_name(c['name'])
        if cc == 'IN':
            st = c['admin1code']
            if st not in IN_STATES:
                continue
            name = RENAME.get((st, name), name)
            region = IN_STATES[st]
            key = ('IN', st, name)
        else:
            keep = pop >= 300000 or (cc in NEIGHBOURS and pop >= 50000) or (cc in DIASPORA and pop >= 100000) or (cc, name) in capitals
            if not keep or cc not in countries:
                continue
            region = countries[cc]
            key = (cc, '', name)
        if key in seen:
            continue
        seen.add(key)
        aliases = []
        if cc == 'IN':
            aliases = sorted(a for a, (st2, canon) in ALIASES.items() if st2 == c['admin1code'] and canon == name and a != name)
        rows.append((pop, name, region, round(c['latitude'], 3), round(c['longitude'], 3), c['timezone'], aliases))
    for name, st, lat, lon, pop in EXTRA_IN:
        if ('IN', st, name) not in seen:
            rows.append((pop, name, IN_STATES[st], lat, lon, 'Asia/Kolkata', []))
            seen.add(('IN', st, name))

    # every alias must point at a city that exists, otherwise the alias silently does nothing
    missing = [a for a, (st, canon) in ALIASES.items() if ('IN', st, canon) not in seen]
    if missing:
        print('ALIASES WITHOUT A TARGET CITY:', missing, file=sys.stderr)
        sys.exit(1)

    rows.sort(key=lambda r: (-r[0], r[1]))
    tzs, regions = [], []
    def idx(lst, v):
        if v not in lst:
            lst.append(v)
        return lst.index(v)
    out = []
    for pop, name, region, lat, lon, tz, aliases in rows:
        row = [name, idx(regions, region), lat, lon, idx(tzs, tz)]
        if aliases:
            row.append('|'.join(aliases))
        out.append(row)
    data = {'source': 'GeoNames (geonames.org), CC BY 4.0', 'tz': tzs, 'rg': regions, 'c': out}
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    india = sum(1 for r in rows if r[5] == 'Asia/Kolkata')
    print(f'{len(out)} places ({india} in India), {len(tzs)} time zones, {len(regions)} regions, {os.path.getsize(OUT)/1024:.0f} KB')


if __name__ == '__main__':
    main()
