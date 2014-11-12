# Jaguar Company
#
# Copyright © 2012-2013 Richard Thomas Harrison (Tricky)
#
# This work is licensed under the Creative Commons
# Attribution-Noncommercial-Share Alike 3.0 Unported License.
#
# To view a copy of this license, visit
# http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter
# to Creative Commons, 171 Second Street, Suite 300, San Francisco,
# California, 94105, USA.
#
# Makefile for Jaguar Company Wings3D models.

ifndef HOME
HOME = /home/$(USERNAME)
endif

REPOS = $(HOME)/.Oolite/OXPs/repos

SHELL = /bin/sh
RM = $(shell which rm) -f
INSTALL = $(shell which install) -p -m 0644
OBJ2DAT = $(shell which Obj2DatTexNorm.py) --preserve-material-names

DEVEL_REPOS = $(REPOS)/jaguar_company

ifeq ($(TAG),trunk)
DEVEL_OXP = $(DEVEL_REPOS)/$(TAG)/jaguar_company.oxp
else ifeq ($(TAG),legacy)
DEVEL_OXP = $(DEVEL_REPOS)/$(TAG)/jaguar_company.oxp
else
$(error Can't build models to '$(TAG)')
endif

ifeq ($(realpath $(DEVEL_OXP)),)
$(error Can't build models to '$(TAG)/jaguar_company'. Does not exist)
endif

MODELS = jaguar_company_tracker.dat \
	jaguar_company_invisible_tracker.dat \
	jaguar_company_base.dat \
	jaguar_company_base_bay.dat \
	jaguar_company_base_turret_holders.dat \
	jaguar_company_base_turret.dat \
	jaguar_company_base_buoy.dat \
	jaguar_company_ship_splinter.dat

MODELS_OXPPATH = $(patsubst %.dat,$(DEVEL_OXP)/Models/%.dat,$(MODELS))

DIFFUSE = jaguar_company_tracker_diffuse.png \
	jaguar_company_invisible_tracker_diffuse.png \
	jaguar_company_base_diffuse.png \
	jaguar_company_base_bay_diffuse.png \
	jaguar_company_base_turret_holder_diffuse.png \
	jaguar_company_base_turret_ball_diffuse.png \
	jaguar_company_base_turret_gun_diffuse.png \
	jaguar_company_base_buoy_diffuse.png \
	jaguar_company_ship_splinter_diffuse.png

DIFFUSE_OXPPATH = $(patsubst %.png,$(DEVEL_OXP)/Textures/%.png,$(DIFFUSE))

EMISSION = jaguar_company_ship_splinter_emission.png
EMISSION =

EMISSION_OXPPATH = $(patsubst %.png,$(DEVEL_OXP)/Textures/%.png,$(EMISSION))

NORMALS = jaguar_company_base_normal.png \
	jaguar_company_base_bay_normal.png \
	jaguar_company_base_turret_holder_normal.png \
	jaguar_company_base_turret_ball_normal.png \
	jaguar_company_base_turret_gun_normal.png

NORMALS_OXPPATH = $(patsubst %.png,$(DEVEL_OXP)/Textures/%.png,$(NORMALS))

EFFECTS = jaguar_company_base_bay_effects.png \
	jaguar_company_base_turret_ball_effects.png \
	jaguar_company_base_turret_gun_effects.png

EFFECTS_OXPPATH = $(patsubst %.png,$(DEVEL_OXP)/Textures/%.png,$(EFFECTS))

TEXTURES = $(DIFFUSE) $(EMISSION) $(NORMALS) $(EFFECTS)
TEXTURES_OXPPATH = $(patsubst %.png,$(DEVEL_OXP)/Textures/%.png,$(TEXTURES))

.PHONY: default all models textures diffuse normals effects clean reallyclean

default: all

all: models diffuse normals effects

models: $(MODELS_OXPPATH)

textures: $(TEXTURES_OXPPATH)

diffuse: $(DIFFUSE_OXPPATH)

emission: $(EMISSION_OXPPATH)

normals: $(NORMALS_OXPPATH)

effects: $(EFFECTS_OXPPATH)

# Models
$(DEVEL_OXP)/Models/%.dat: %.dat
	$(INSTALL) $< $@

%.dat: %.obj %.mtl
	$(OBJ2DAT) $<

# Textures
$(DEVEL_OXP)/Textures/%.png: %.png
	$(INSTALL) $< $@

clean: clean-models clean-diffuse clean-emission clean-normals clean-effects

clean-models:
	$(RM) $(MODELS)
	$(RM) $(MODELS_OXPPATH)

clean-textures:
	$(RM) $(TEXTURES_OXPPATH)

clean-diffuse:
	$(RM) $(DIFFUSE_OXPPATH)

clean-emission:
	$(RM) $(EMISSION_OXPPATH)

clean-normals:
	$(RM) $(NORMALS_OXPPATH)

clean-effects:
	$(RM) $(EFFECTS_OXPPATH)

reallyclean: reallyclean-models reallyclean-diffuse reallyclean-emission reallyclean-normals reallyclean-effects

reallyclean-models: clean-models

reallyclean-textures: clean-textures

reallyclean-diffuse: clean-diffuse

reallyclean-emission: clean-emission

reallyclean-normals: clean-normals

reallyclean-effects: clean-effects
