# Project Scripts

This directory contains project-wide automation scripts organized by functional area.

## 📁 Current Structure

```
/scripts/
└── README.md               # This file
```

## 📚 Documentation Scripts

**Documentation-specific scripts have been moved to `/docs/scripts/`** for better organization and context.

### **Why the Move?**
- ✅ **Context-Specific**: Documentation scripts belong with documentation
- ✅ **AI-First Integration**: Supports Claude Code workflow patterns  
- ✅ **Cleaner Separation**: Keeps doc tools separate from build/deploy scripts
- ✅ **Easier Discovery**: Doc maintainers find tools where they expect them

### **Quick Access**
```bash
# From project root
cd docs
./scripts/validation/validate-docs.sh

# From anywhere
docs/scripts/validation/validate-docs.sh
```

## 🔮 Future Structure

This directory is reserved for project-wide scripts:

```
/scripts/                    # Project-wide automation
├── build/                   # Build automation scripts
├── deploy/                  # Deployment scripts  
├── db/                      # Database maintenance
├── test/                    # Testing automation
└── README.md               # This file
```

## 📖 Documentation

**For all documentation scripts**: See [`/docs/scripts/README.md`](/docs/scripts/README.md)

---

**📅 Last Updated**: Post-Phase 3 Restructuring  
**🎯 Current Focus**: Clean separation of concerns  
**📂 Status**: Ready for future project-wide script additions