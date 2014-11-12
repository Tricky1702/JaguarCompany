# Makefile
#
# Copyright © 2012-2014 Richard Thomas Harrison (Tricky)
#
# This work is licensed under the Creative Commons License
# Attribution-Noncommercial-Share Alike 4.0 International (CC BY-NC-SA 4.0)
#
# To view a copy of this license, visit
# http://creativecommons.org/licenses/by-nc-sa/4.0/ or send an email
# to info@creativecommons.org
#
# Makefile for Jaguar Company OXP.

ifndef HOME
	HOME = /home/$(USERNAME)
endif

SHELL = /bin/sh
CP = $(shell which cp) -a
RM = $(shell which rm) -f
MV = $(shell which mv)
MD = $(shell which mkdir)
CAT = $(shell which cat)
SED = $(shell which sed)
ZIP = $(shell which zip)
BZR = /usr/bin/bzr
EXPORT = $(BZR) export

BASEDIR = $(HOME)/.Oolite/OXPs
GAMESDIR = $(HOME)/Games
OOLITEDIR = $(GAMESDIR)/Oolite

ifndef V176
	V176 = 0
endif
ifndef V177
	V177 = 1
endif
ifndef V180
	V180 = 1
endif

ifeq ($(V176),1)
	OOLITE176 = v1.76.1
endif
ifeq ($(V177),1)
	OOLITE177 = v1.77/Deployment v1.77/Development
endif
ifeq ($(V180),1)
	OOLITE180 = v1.80/Deployment v1.80/Development v1.80/Vsync.Test1 v1.80/Vsync.Test2
endif

TAG ?= trunk

DEVELNAME = jaguar_company
DEVEL_OXP = $(TAG)/$(DEVELNAME).oxp

ifeq ($(TAG),trunk)
	_OXZCOMPAT = 1
	_AUTHOR = $(shell $(SED) -n 's/^\s*author\s*=\s*\(.*\)\s*$$/\1/p' config)
	_CATEGORY = $(shell $(SED) -n 's/^\s*category\s*=\s*\(.*\)\s*$$/\1/p' config)
	_COPYRIGHT = $(shell $(SED) -n -e 's/^\s*copyright\s*=\s*\(.*\)\s*$$/\1/p' config)
	_DESCRIPTION = $(shell $(SED) -n 's/^\s*description\s*=\s*\(.*\)\s*$$/\1/p' config)
	_DOWNLOAD_URL = $(shell $(SED) -n 's/^\s*download_url\s*=\s*\(.*\)\s*$$/\1/p' config)
	_IDENTIFIER = $(shell $(SED) -n 's/^\s*identifier\s*=\s*\(.*\)\s*$$/\1/p' config)
	_INFORMATION_URL = $(shell $(SED) -n 's/^\s*information_url\s*=\s*\(.*\)\s*$$/\1/p' config)
	_LICENSE = $(shell $(SED) -n 's/^\s*license\s*=\s*\(.*\)\s*$$/\1/p' config)
	_LICENSE_FULL = $(shell $(SED) -n 's/^\s*license_full\s*=\s*\(.*\)\s*$$/\1/p' config)
	_LICENSE_URL = $(shell $(SED) -n 's/^\s*license_url\s*=\s*\(.*\)\s*$$/\1/p' config)
	_REQUIRED_OOLITE_VERSION = $(shell $(SED) -n 's/^\s*required_oolite_version\s*=\s*\(.*\)\s*$$/\1/p' config)
	_TITLE = $(shell $(SED) -n 's/^\s*title\s*=\s*\(.*\)\s*$$/\1/p' config)
	_VERSION = $(shell $(SED) -n 's/^\s*version\s*=\s*\(.*\)\s*$$/\1/p' config)
else ifeq ($(realpath $(DEVEL_OXP)/manifest.plist),)
	_OXZCOMPAT = 0
	_VERSION = $(strip $(shell $(SED) -n 's/^.* this\.version = \"\(.*\)\";$$/\1/p' $(TAG)/$(DEVELNAME)_*.oxp/Scripts/jaguar_company.js))
else
	_OXZCOMPAT = 1
	_IDENTIFIER = $(strip $(shell $(SED) -n 's/^.*[$$]IDENTIFIER: \(.*\)[$$]$$/\1/p' $(DEVEL_OXP)/manifest.plist))
	_VERSION = $(strip $(shell $(SED) -n 's/^.*[$$]VER: \(.*\)[$$]$$/\1/p' $(DEVEL_OXP)/manifest.plist))
endif

ifeq ($(V180),0)
	_OXZCOMPAT = 0
endif

ifndef VER
	VER = $(_VERSION)
	VERREV = $(strip $(shell echo $(VER)r`$(BZR) revno`))
else ifneq ($(VER),$(_VERSION))
	TAG = tags/$(VER)
	VERREV = $(strip $(shell echo $(VER)r`$(BZR) revno -rtag:$(VER)`))
else
	VERREV = $(strip $(shell echo $(VER)r`$(BZR) revno`))
endif

ifeq ($(realpath $(TAG)),)
	TAG = trunk
	VER = $(_VERSION)
	VERREV = $(strip $(shell echo $(VER)r`$(BZR) revno`))
endif

ifeq ($(TAG),trunk)
	DEVEL_BASENAME = $(DEVELNAME).oxp
else
	DEVEL_BASENAME = $(DEVELNAME)_$(VER).oxp
endif

OXP = $(OXPNAME)_$(VER).oxp

ifeq ($(_OXZCOMPAT),1)
	OXZ = $(_IDENTIFIER).oxz
endif

OOLITEDIRS =

ifeq ($(V176),1)
	OOLITEDIRS += $(OOLITE176)
endif
ifeq ($(V177),1)
	OOLITEDIRS += $(OOLITE177)
endif
ifeq ($(V180),1)
	ifeq ($(_OXZCOMPAT),0)
		OOLITEDIRS += $(OOLITE180)
	endif
endif

ADDONDIRS = $(patsubst %,$(OOLITEDIR)/%/AddOns,$(OOLITEDIRS))
OXPDIRS = $(patsubst %,%/Tricky.oxp/$(OXP),$(ADDONDIRS))

ifeq ($(V180),1)
	ifeq ($(_OXZCOMPAT),1)
#		MANAGEDADDONS = oolite.app/GNUstep/Library/ApplicationSupport/Oolite/ManagedAddOns
		MANAGEDADDONS = AddOns/Tricky.oxp
		OXZADDONDIRS = $(patsubst %,$(OOLITEDIR)/%/$(MANAGEDADDONS),$(OOLITE180))
		OXZPATH = $(patsubst %,%/$(OXZ),$(OXZADDONDIRS))
	endif
endif

# Default Wings3D directory.
_WINGSDIR = Wings3D
WINGSDIR ?= $(_WINGSDIR)

BASEOXPDIR = $(BASEDIR)/$(OXPNAME)_$(VER)/$(OXP)
SEDARGS = \
	-e 's/[$$]AUTHOR[$$]/$(_AUTHOR)/' \
	-e 's/[$$]COPYRIGHT[$$]/$(_COPYRIGHT)/' \
	-e 's/[$$]LICENSE[$$]/$(_LICENSE)/' \
	-e 's/[$$]LICENSE_FULL[$$]/$(_LICENSE_FULL)/' \
	-e 's=[$$]LICENSE_URL[$$]=$(_LICENSE_URL)=' \
	-e 's/[$$]VERSION[$$]/$(_VERSION)/'
SCRIPTFILES = $(wildcard $(BASEOXPDIR)/Scripts/*.js)
AIPLISTFILES = $(wildcard $(BASEOXPDIR)/AIs/*.plist)

TMPDIR = $(BASEDIR)/tmp/$(DEVELNAME)

.PHONY: default all test jc models textures release clean reallyclean

default: test

all: jc

jc: $(BASEDIR)/$(OXPNAME)_$(VER) fix-files touch-export makearchive $(OXPDIRS) $(OXZPATH)
fake-jc: fake-export fix-files touch-export makearchive $(OXPDIRS) $(OXZPATH)

models:
	$(MAKE) -C $(WINGSDIR) TAG=$(TAG) models

textures:
	$(MAKE) -C $(WINGSDIR) TAG=$(TAG) textures

test:
	@echo "TAG:                 \`$(TAG)'"
	@echo "_VERSION:            \`$(_VERSION)'"
	@echo "VER:                 \`$(VER)'"
	@echo "VERREV:              \`$(VERREV)'"
	@echo "OXPNAME:             \`$(OXPNAME)'"
	@echo "DEVEL_BASENAME:      \`$(DEVEL_BASENAME)'"
	@echo "DEVEL_OXP:           \`$(DEVEL_OXP)'"
	@echo "OXP:                 \`$(OXP)'"
	@echo "OXPDIRS:             \`$(OXPDIRS)'"
ifeq ($(_OXZCOMPAT),1)
	@echo "_IDENTIFIER:         \`$(_IDENTIFIER)'"
	@echo "OXZ:                 \`$(OXZ)'"
	@echo "OXZPATH:             \`$(OXZPATH)'"
endif

test-release: test clean fake-jc

release: clean jc

$(OOLITEDIR)/%/$(OXP):
	$(MD) -p $@
	$(CP) -t $@ $(BASEOXPDIR)/*

$(OOLITEDIR)/%/$(OXZ):
ifeq ($(_OXZCOMPAT),1)
	$(CP) -L $(BASEDIR)/$(OXPNAME)_$(VER).oxz $@
endif

$(BASEDIR)/$(OXPNAME)_$(VER):
	$(EXPORT) $@ $(TAG)
	$(MV) $@/$(DEVEL_BASENAME) $@/$(OXP)

fake-export:
	$(MD) -p $(BASEDIR)/$(OXPNAME)_$(VER)
	$(CP) $(TAG)/* $(BASEDIR)/$(OXPNAME)_$(VER)
	cd $(BASEDIR)/$(OXPNAME)_$(VER) && $(MV) $(DEVEL_BASENAME) x$(OXP)
	cd $(BASEDIR)/$(OXPNAME)_$(VER) && $(MV) x$(OXP) $(OXP)

fix-files:
	$(MD) -p $(TMPDIR)/Scripts
	@$(foreach file,$(SCRIPTFILES),$(SED) $(SEDARGS) $(file) > $(TMPDIR)/Scripts/$(notdir $(file));)
	cd $(TMPDIR)/Scripts && $(CP) *.js $(BASEOXPDIR)/Scripts
	$(MD) -p $(TMPDIR)/AIs
	@$(foreach file,$(AIPLISTFILES),$(SED) $(SEDARGS) $(file) > $(TMPDIR)/AIs/$(notdir $(file));)
	cd $(TMPDIR)/AIs && $(CP) *.plist $(BASEOXPDIR)/AIs

touch-export:
	$(BASEDIR)/touch_export.sh $(TAG) $(DEVELNAME) $(OXPNAME)

tag: tags/$(VER)

tags/$(VER):
	$(MD) -p $@
	$(CP) trunk/* $@
	cd $@ && $(MV) $(DEVELNAME).oxp $(DEVELNAME)_$(VER).oxp

makezip:
	@$(RM) $(BASEOXPDIR)/manifest.plist
	cd $(BASEDIR) && $(ZIP) -q9or $(OXPNAME)_$(VERREV).zip $(OXPNAME)_$(VER)
	cd $(BASEDIR) && $(ZIP) -T $(OXPNAME)_$(VERREV).zip
	cd $(BASEDIR) && ln -sf $(OXPNAME)_$(VERREV).zip $(OXPNAME)_$(VER).zip

makeoxz:
ifeq ($(_OXZCOMPAT),1)
	$(MD) -p $(TMPDIR)
	@$(SED) \
		-e 's/[$$]AUTHOR[$$]/$(_AUTHOR)/' \
		-e 's/[$$]CATEGORY[$$]/$(_CATEGORY)/' \
		-e 's/[$$]COPYRIGHT[$$]/$(_COPYRIGHT)/' \
		-e 's/[$$]DESCRIPTION[$$]/$(_DESCRIPTION)/' \
		-e 's=[$$]DOWNLOAD_URL[$$]=$(_DOWNLOAD_URL)=' \
		-e 's/[$$]IDENTIFIER[$$]/$(_IDENTIFIER)/' \
		-e 's=[$$]INFORMATION_URL[$$]=$(_INFORMATION_URL)=' \
		-e 's/[$$]LICENSE[$$]/$(_LICENSE)/' \
		-e 's/[$$]LICENSE_FULL[$$]/$(_LICENSE_FULL)/' \
		-e 's=[$$]LICENSE_URL[$$]=$(_LICENSE_URL)=' \
		-e 's/[$$]REQUIRED_OOLITE_VERSION[$$]/$(_REQUIRED_OOLITE_VERSION)/' \
		-e 's/[$$]TITLE[$$]/$(_TITLE)/' \
		-e 's/[$$]VERSION[$$]/$(_VERSION)/' manifest.plist > $(TMPDIR)/manifest.plist
	@$(RM) $(BASEOXPDIR)/manifest.plist
	$(MV) $(TMPDIR)/manifest.plist $(BASEOXPDIR)/manifest.plist
	cd $(BASEOXPDIR) && $(ZIP) -q9or $(OXPNAME)_$(VERREV).oxz .
	cd $(BASEDIR) && $(MV) $(OXPNAME)_$(VER)/$(OXP)/$(OXPNAME)_$(VERREV).oxz .
	cd $(BASEDIR) && $(ZIP) -T $(OXPNAME)_$(VERREV).oxz
	cd $(BASEDIR) && ln -sf $(OXPNAME)_$(VERREV).oxz $(OXPNAME)_$(VER).oxz
endif

cleantmp:
	$(RM) -r $(TMPDIR)

cleanzip:
	$(RM) $(BASEDIR)/$(OXPNAME)_$(VERREV).zip
	$(RM) $(BASEDIR)/$(OXPNAME)_$(VER).zip

cleanoxz:
ifeq ($(_OXZCOMPAT),1)
	$(RM) $(BASEDIR)/$(OXPNAME)_$(VERREV).oxz
	$(RM) $(BASEDIR)/$(OXPNAME)_$(VER).oxz
endif

makearchive: makezip makeoxz

clean-oxp:
	$(RM) -r $(BASEDIR)/$(OXPNAME)_$(VER)
	$(RM) -r $(OXPDIRS)
ifeq ($(_OXZCOMPAT),1)
	$(RM) $(OXZPATH)
endif

clean-models:
	$(MAKE) -C $(WINGSDIR) TAG=$(TAG) clean-models

clean-textures:
	$(MAKE) -C $(WINGSDIR) TAG=$(TAG) clean-textures

clean: cleantmp cleanzip cleanoxz clean-oxp

reallyclean: clean clean-models clean-textures
