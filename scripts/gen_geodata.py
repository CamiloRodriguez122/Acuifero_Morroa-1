# -*- coding: utf-8 -*-
"""Genera las capas GeoJSON base del acuifero Morroa (WGS84 / EPSG:4326).

La delimitacion se digitalizo a partir del Mapa Geologico de la Formacion Morroa
(afloramiento Tpm) y del mapa de Recarga Anual 2023 del acuifero, anclando los
vertices a las coordenadas oficiales de las cabeceras municipales.
Es una aproximacion cartografica: se reemplaza por el shapefile oficial de
CARSUCRE/IDEAM sustituyendo unicamente estos archivos.
"""
import json, math, random, os

random.seed(20260916)
OUT = "public/data"
os.makedirs(OUT, exist_ok=True)

# --- Limite exterior del sistema acuifero (confinado + aflorante) ---
ACUIFERO = [
    [-75.2050, 9.5750], [-75.1600, 9.5450], [-75.1750, 9.4950], [-75.2100, 9.4650],
    [-75.2350, 9.4300], [-75.2300, 9.4000], [-75.2450, 9.3700], [-75.2500, 9.3400],
    [-75.2600, 9.3100], [-75.2750, 9.2750], [-75.2950, 9.2400], [-75.3150, 9.2100],
    [-75.3350, 9.1800], [-75.3500, 9.1500], [-75.3750, 9.1250], [-75.4100, 9.1300],
    [-75.4400, 9.1600], [-75.4450, 9.1950], [-75.4250, 9.2300], [-75.4100, 9.2650],
    [-75.4200, 9.2950], [-75.4300, 9.3250], [-75.4050, 9.3500], [-75.3750, 9.3750],
    [-75.3500, 9.4050], [-75.3250, 9.4350], [-75.3050, 9.4700], [-75.2850, 9.5050],
    [-75.2650, 9.5400], [-75.2400, 9.5650],
]

# --- Franja de afloramiento de la Formacion Morroa = zona de recarga directa ---
RECARGA_W = [
    [-75.2500, 9.5500], [-75.2700, 9.5000], [-75.2900, 9.4500], [-75.3100, 9.4000],
    [-75.3300, 9.3550], [-75.3480, 9.3150], [-75.3680, 9.2700], [-75.3830, 9.2250],
    [-75.3980, 9.1800], [-75.4060, 9.1450],
]
RECARGA_E = [
    [-75.3650, 9.1420], [-75.3530, 9.1800], [-75.3380, 9.2250], [-75.3230, 9.2700],
    [-75.3030, 9.3150], [-75.2830, 9.3550], [-75.2630, 9.4000], [-75.2430, 9.4500],
    [-75.2230, 9.5000], [-75.2030, 9.5500],
]
RECARGA = RECARGA_W + RECARGA_E

def ring(coords):
    r = [list(map(float, c)) for c in coords]
    if r[0] != r[-1]:
        r.append(r[0])
    return [r]

def fc(feats):
    return {"type": "FeatureCollection", "features": feats}

def write(name, obj):
    p = os.path.join(OUT, name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{p}  {os.path.getsize(p)/1024:.1f} KB")

# ---------------------------------------------------------------- acuifero
write("acuifero-morroa.geojson", fc([{
    "type": "Feature",
    "properties": {
        "nombre": "Acuifero Morroa",
        "unidad": "Formacion Morroa (Tpm)",
        "area_km2": 1120,
        "espesor_medio_m": 320,
        "fuente": "Digitalizado sobre mapa geologico Fm. Morroa y mapa de recarga 2023",
    },
    "geometry": {"type": "Polygon", "coordinates": ring(ACUIFERO)},
}]))

write("zona-recarga.geojson", fc([{
    "type": "Feature",
    "properties": {
        "nombre": "Zona de recarga directa",
        "unidad": "Afloramiento Fm. Morroa (Tpm)",
        "recarga_mm_ano": 172,
        "fuente": "Mapa de Recarga Anual 2023 (IDEAM / Google Earth Engine)",
    },
    "geometry": {"type": "Polygon", "coordinates": ring(RECARGA)},
}]))

# ------------------------------------------------------------------- pozos
# DATOS DE DEMOSTRACION. Red de monitoreo sintetica, coherente en magnitud y
# tendencia con lo descrito en la literatura (Buitrago & Donado, 2000; CARSUCRE,
# 2024), usada solo para validar la visualizacion mientras se integra el
# historico oficial de CARSUCRE en Supabase.
POZOS = [
    # codigo        nombre                    municipio        lon        lat     prof  cota  NE0   tend
    ("POZ-SIN-01", "Sincelejo Norte",         "Sincelejo",     -75.3820, 9.3350,  310,  213,  62.0, 0.85),
    ("POZ-SIN-02", "La Palma",                "Sincelejo",     -75.4010, 9.3020,  340,  205,  68.4, 1.05),
    ("POZ-SIN-03", "Venecia",                 "Sincelejo",     -75.3650, 9.2870,  295,  198,  59.1, 0.92),
    ("POZ-SIN-04", "El Cortijo",              "Sincelejo",     -75.4060, 9.2760,  360,  186,  71.8, 1.18),
    ("POZ-MOR-01", "Morroa Cabecera",         "Morroa",        -75.3090, 9.3330,  240,  248,  41.6, 0.48),
    ("POZ-MOR-02", "Sabaneta",                "Morroa",        -75.3300, 9.3620,  225,  262,  36.9, 0.35),
    ("POZ-COR-01", "Corozal Centro",          "Corozal",       -75.2960, 9.3180,  280,  172,  54.3, 0.74),
    ("POZ-COR-02", "Las Llanadas",            "Corozal",       -75.2780, 9.2930,  305,  165,  57.7, 0.81),
    ("POZ-SAM-01", "Sampues Cabecera",        "Sampues",       -75.3790, 9.1850,  330,  145,  64.2, 0.96),
    ("POZ-SAM-02", "Segovia",                 "Sampues",       -75.4020, 9.2080,  315,  152,  60.8, 0.88),
    ("POZ-LPA-01", "Los Palmitos Cabecera",   "Los Palmitos",  -75.2740, 9.3780,  265,  188,  47.5, 0.61),
    ("POZ-LPA-02", "Sabanas de Pedro",        "Los Palmitos",  -75.2900, 9.4080,  250,  201,  43.2, 0.52),
    ("POZ-OVE-01", "Ovejas Cabecera",         "Ovejas",        -75.2300, 9.5270,  210,  268,  33.4, 0.29),
    ("POZ-OVE-02", "Canutal",                 "Ovejas",        -75.2050, 9.4930,  235,  241,  38.7, 0.37),
    ("POZ-OVE-03", "Don Gabriel",             "Ovejas",        -75.2480, 9.4620,  220,  255,  35.1, 0.31),
    ("POZ-SJB-01", "San Juan de Betulia",     "San Juan de Betulia", -75.2820, 9.2740, 290, 158, 52.9, 0.69),
    ("POZ-SIN-05", "Chochó",                  "Sincelejo",     -75.3520, 9.2620,  300,  191,  57.4, 0.87),
    ("POZ-COR-03", "Hato Nuevo",              "Corozal",       -75.2650, 9.3450,  270,  178,  49.8, 0.66),
]

ANIO_INI, ANIO_FIN = 2010, 2025
MESES = [(a, m) for a in range(ANIO_INI, ANIO_FIN + 1) for m in range(1, 13)]
# Regimen bimodal del Caribe seco colombiano: recuperacion en mayo y sep-oct.
ESTACIONAL = [1.35, 1.55, 1.70, 1.20, -0.45, -0.80, -0.25, -0.60, -1.40, -1.65, -0.55, 0.65]

feats = []
for cod, nom, mun, lon, lat, prof, cota, ne0, tend in POZOS:
    # La serie se guarda como un vector de niveles con su mes inicial: evita
    # repetir 192 etiquetas de fecha por pozo y reduce el GeoJSON a la mitad.
    niveles = []
    ruido = 0.0
    for i, (_, m) in enumerate(MESES):
        t = i / 12.0
        ruido = 0.72 * ruido + random.gauss(0, 0.30)          # persistencia interanual
        ne = ne0 + tend * t + ESTACIONAL[m - 1] * 0.55 + ruido
        niveles.append(round(ne, 2))
    ne_actual = niveles[-1]
    feats.append({
        "type": "Feature",
        "properties": {
            "codigo": cod, "nombre": nom, "municipio": mun,
            "profundidad_m": prof, "cota_terreno_msnm": cota,
            "nivel_estatico_m": round(ne_actual, 2),
            "cota_piezometrica_msnm": round(cota - ne_actual, 2),
            "tendencia_m_ano": round(tend, 2),
            "descenso_acumulado_m": round(niveles[-1] - niveles[0], 2),
            "minimo_m": round(min(niveles), 2),
            "maximo_m": round(max(niveles), 2),
            "promedio_m": round(sum(niveles) / len(niveles), 2),
            "periodo": f"{ANIO_INI}-{ANIO_FIN}",
            "n_registros": len(niveles),
            "inicio": f"{ANIO_INI}-01",
            "niveles": niveles,
            "origen": "demo",
        },
        "geometry": {"type": "Point", "coordinates": [lon, lat]},
    })

write("pozos.geojson", fc(feats))
