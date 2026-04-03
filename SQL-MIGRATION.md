# TORA App - SQL Migration Project

## Overview
This is a parallel copy of the TORA App for migrating from MongoDB to PostgreSQL (Supabase), matching the architecture of the tora-application landing page.

**Created**: March 31, 2026
**Purpose**: Migrate backend from MongoDB to Supabase PostgreSQL without disrupting production
**Strategy**: Parallel development - both MongoDB and SQL versions can run simultaneously

---

## Project Structure

### Frontend: `tora-app-sql`
- **Port**: 3002 (different from production on 3001)
- **API URL**: `http://192.168.2.101:5002/api`
- **Source**: Copy of tora-app with all latest formatting changes
- **Status**: ✅ Ready for SQL backend integration

### Backend: `tora-backend-sql`
- **Port**: 5002 (different from production on 5001)
- **Database**: Supabase PostgreSQL (to be configured)
- **Source**: Copy of tora-backend (currently MongoDB)
- **Status**: ⏳ Pending SQL migration

---

## Port Configuration

| Component | MongoDB Version (Production) | SQL Version (Development) |
|-----------|------------------------------|---------------------------|
| Frontend  | 3001                         | 3002                      |
| Backend   | 5001                         | 5002                      |
| Database  | MongoDB (local/Atlas)        | Supabase PostgreSQL       |

This allows both versions to run side-by-side for testing and comparison.

---

## Migration Strategy

### Phase 1: Database Setup (Week 1)
- [ ] Create Supabase project
- [ ] Design PostgreSQL schema matching MongoDB collections
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create database indexes for performance
- [ ] Set up connection pooling

### Phase 2: Data Models (Week 2)
- [ ] Convert Mongoose models to SQL queries
- [ ] Implement Supabase client instead of MongoDB client
- [ ] Create database migration scripts
- [ ] Update all model files (User, Profile, Connection, Deal, etc.)

### Phase 3: API Endpoints (Week 3-4)
- [ ] Migrate authentication endpoints
- [ ] Migrate profile endpoints
- [ ] Migrate connection/messaging endpoints
- [ ] Migrate booking/deal endpoints
- [ ] Migrate tour endpoints
- [ ] Update all CRUD operations

### Phase 4: Testing & Data Migration (Week 5)
- [ ] Export existing MongoDB data
- [ ] Transform and import to PostgreSQL
- [ ] Test all features end-to-end
- [ ] Performance testing
- [ ] Bug fixes

### Phase 5: Deployment (Week 6)
- [ ] Deploy SQL backend to production
- [ ] Update frontend to use SQL backend
- [ ] Monitor for issues
- [ ] Keep MongoDB as backup temporarily

---

## Database Schema Comparison

### MongoDB Collections → PostgreSQL Tables

| MongoDB Collection | PostgreSQL Table | Notes |
|--------------------|------------------|-------|
| users              | users            | Basic auth data |
| profiles           | profiles         | User profiles with all fields |
| connections        | connections      | Friend/connection relationships |
| messages           | messages         | Chat messages |
| deals              | deals            | Booking offers/contracts |
| tours              | tours            | Tour kickstart feature |
| notifications      | notifications    | System notifications |

### Key Schema Changes
- **ObjectId → UUID**: All MongoDB ObjectIds become PostgreSQL UUIDs
- **Embedded Documents → Foreign Keys**: Nested objects become relations
- **Arrays → Junction Tables**: Many-to-many relationships (genres, liked profiles)
- **Timestamps**: Automatic created_at/updated_at with PostgreSQL triggers

---

## Supabase Configuration (To Be Set Up)

### Environment Variables (.env)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# API Configuration
PORT=5002
NODE_ENV=development
```

### Required Supabase Tables
1. **users** - Authentication data
2. **profiles** - User profiles
3. **connections** - Relationships
4. **messages** - Chat data
5. **deals** - Bookings
6. **tours** - Tour data
7. **notifications** - System notifications
8. **documents** - File/contract tracking

---

## Running Both Versions Simultaneously

### Start MongoDB Version (Production)
```bash
# Backend (MongoDB)
cd /Users/alessandrocastelbuono/Desktop/tora-backend
npm run dev  # Runs on port 5001

# Frontend
cd /Users/alessandrocastelbuono/Desktop/tora-app
REACT_APP_API_URL=http://192.168.2.101:5001/api HOST=0.0.0.0 PORT=3001 npm start
```

### Start SQL Version (Development)
```bash
# Backend (Supabase)
cd /Users/alessandrocastelbuono/Desktop/tora-backend-sql
PORT=5002 npm run dev  # Runs on port 5002

# Frontend
cd /Users/alessandrocastelbuono/Desktop/tora-app-sql
REACT_APP_API_URL=http://192.168.2.101:5002/api HOST=0.0.0.0 PORT=3002 npm start
```

### Access URLs
- **MongoDB Version**: http://192.168.2.101:3001
- **SQL Version**: http://192.168.2.101:3002

---

## Benefits of SQL Migration

### Advantages of PostgreSQL over MongoDB

1. **Better for Landing Page Integration**
   - Same database technology as tora-application
   - Unified admin experience
   - Easier cross-referencing between waitlist and app users

2. **Stronger Data Integrity**
   - Foreign key constraints
   - Transaction support (ACID compliance)
   - Schema validation

3. **Better Query Performance**
   - Complex joins are more efficient
   - Advanced indexing options
   - Query optimization tools

4. **Cost & Scalability**
   - Supabase free tier: 500MB database + 2GB bandwidth
   - Built-in realtime subscriptions
   - Automatic backups

5. **Developer Experience**
   - SQL is more standardized
   - Better tooling and admin interfaces
   - Row Level Security (RLS) for fine-grained permissions

---

## Migration Checklist

### Before Starting
- [x] Create parallel project copies (tora-app-sql, tora-backend-sql)
- [x] Document migration strategy
- [x] Configure port settings (Frontend: 3002, Backend: 5002)
- [x] Update .env files with correct API URLs and ports
- [x] Configure CORS for port 3002 in backend
- [ ] Create Supabase project
- [ ] Design complete database schema
- [ ] Set up local Supabase instance for testing

### During Migration
- [ ] Convert one model at a time
- [ ] Test each endpoint after conversion
- [ ] Keep MongoDB version running for comparison
- [ ] Document any breaking changes

### After Migration
- [ ] Export all MongoDB data
- [ ] Import to PostgreSQL with transformations
- [ ] Run parallel tests (both databases)
- [ ] Performance benchmarking
- [ ] Update all documentation

---

## Notes

- **Don't delete MongoDB version** until SQL migration is 100% complete and tested
- **Test thoroughly** - this is production data migration
- **Keep both versions** running for at least 2 weeks after migration
- **Backup everything** before final switchover

---

## Contact

For questions or issues with this migration:
- Check this document first
- Review tora-application/CLAUDE.md for Supabase setup reference
- Test changes in SQL version before applying to production
