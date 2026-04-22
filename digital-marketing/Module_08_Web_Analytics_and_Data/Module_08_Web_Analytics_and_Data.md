# Module 08: Web Analytics & Data Science for Marketing

---

## 8.1 Analytics Fundamentals

### 8.1.1 Why Analytics Matters
- Data-driven decision making vs. intuition-based marketing
- The analytics maturity model: descriptive → diagnostic → predictive → prescriptive
- Building a culture of data-driven marketing
- Common analytics mistakes and how to avoid them
- Analytics ethics and responsible data use

### 8.1.2 Key Analytics Concepts
- Users, sessions, pageviews: definitions and differences
- Bounce rate vs. engagement rate
- Conversion and conversion rate
- Attribution: how credit is assigned to marketing touchpoints
- Cohort analysis: tracking groups of users over time
- Funnel analysis: step-by-step conversion tracking
- Segmentation: breaking data into meaningful groups

### 8.1.3 Analytics Architecture
- Data collection: tags, pixels, SDKs
- Data processing: filtering, sampling, aggregation
- Data storage: databases, data warehouses, data lakes
- Data visualization: dashboards, reports, ad hoc analysis
- Data governance: accuracy, privacy, access control
- First-party data strategy

---

## 8.2 Google Analytics 4 (GA4)

### 8.2.1 GA4 Setup & Configuration
- Creating a GA4 property
- Installing the GA4 tag (gtag.js, Google Tag Manager)
- Data streams: web, iOS, Android
- Enhanced measurement events: scrolls, outbound clicks, site search, video engagement, file downloads
- Cross-domain tracking setup
- Internal traffic filtering
- Referral exclusion lists
- Data retention settings
- User ID and Google Signals
- Linking Google Ads, Search Console, BigQuery

### 8.2.2 GA4 Event Model
- Understanding the event-based data model (vs. session-based Universal Analytics)
- Automatically collected events
- Enhanced measurement events
- Recommended events (e-commerce, lead gen)
- Custom events: when and how to create them
- Event parameters and user properties
- Event naming conventions and best practices
- Conversion events (key events) setup
- Event modification and creation rules

### 8.2.3 GA4 Reports & Interface
- Home and real-time reports
- Life cycle reports: Acquisition, Engagement, Monetization, Retention
- User reports: demographics, tech, user explorer
- Explore hub: free-form, funnel, path, segment overlap, cohort, user lifetime
- Advertising workspace: attribution, conversion paths, model comparison
- Library: customizing reports and navigation
- Comparisons and date range analysis
- Search bar and Insights features

### 8.2.4 GA4 Audiences & Segments
- Creating audiences based on events, parameters, user properties
- Predictive audiences: likely purchasers, likely churners
- Audience triggers for event creation
- Segments in Explorations: user, session, event segments
- Audience export to Google Ads for remarketing
- Audience builder best practices

### 8.2.5 GA4 E-commerce Tracking
- Setting up e-commerce events: view_item, add_to_cart, begin_checkout, purchase
- Product-scoped parameters
- Promotion tracking
- Revenue reporting and monetization reports
- Funnel analysis for checkout
- Product performance analysis
- Refund tracking

---

## 8.3 Google Tag Manager (GTM)

### 8.3.1 GTM Fundamentals
- What is GTM and why use it
- Container, workspace, and version concepts
- Tags, triggers, and variables explained
- GTM vs. hardcoded tags
- GTM for web vs. Server-Side GTM
- GTM access and permissions management

### 8.3.2 Implementing Tracking with GTM
- Installing GA4 via GTM
- Setting up event tracking: clicks, form submissions, video views, scroll depth
- Custom event creation
- Enhanced e-commerce tracking
- Cross-domain tracking configuration
- Setting up conversion tracking for Google Ads, Meta Pixel, LinkedIn Insight Tag
- Custom HTML tags and scripts
- Consent mode implementation

### 8.3.3 Advanced GTM Techniques
- Data Layer implementation and usage
- Custom JavaScript variables
- Regular expression tables and lookup tables
- Event sequencing
- GTM debugging: preview mode, Tag Assistant
- Server-side GTM: setup, benefits, use cases
- GTM templates and community gallery
- Version control and change management

---

## 8.4 Attribution Modeling

### 8.4.1 Understanding Attribution
- What is marketing attribution
- Why attribution matters for budget allocation
- The attribution challenge: multi-device, cross-channel, privacy
- Single-touch vs. multi-touch attribution
- View-through vs. click-through attribution

### 8.4.2 Attribution Models
- First-click attribution: when to use
- Last-click attribution: limitations and use cases
- Linear attribution: equal credit distribution
- Time-decay attribution: recency-weighted
- Position-based (U-shaped): first and last emphasis
- Data-driven attribution: machine learning approach
- Custom attribution models
- Comparing models and choosing the right one

### 8.4.3 Advanced Attribution
- Marketing Mix Modeling (MMM): aggregate-level, privacy-friendly
- Multi-Touch Attribution (MTA): user-level, granular
- Unified measurement approaches
- Incrementality testing: holdout experiments, geo-lift tests
- Media mix optimization
- Tools: Google Attribution, Meta Attribution, third-party platforms (Rockerbox, Triple Whale, Northbeam)
- Post-cookie attribution strategies

---

## 8.5 Data Visualization & Reporting

### 8.5.1 Google Looker Studio (Data Studio)
- Creating reports and dashboards
- Connecting data sources: GA4, Google Ads, Search Console, Sheets, BigQuery
- Building charts and tables
- Calculated fields and custom metrics
- Filters, controls, and interactivity
- Date range selectors and comparison features
- Blending data from multiple sources
- Template gallery and custom templates
- Sharing and embedding reports
- Scheduled email delivery

### 8.5.2 Other Visualization Tools
- Tableau: advanced analytics and visualization
- Power BI: Microsoft ecosystem integration
- Databox: real-time dashboards, goal tracking
- Klipfolio: lightweight dashboards
- Supermetrics: data connector and ETL tool
- Choosing the right tool for your needs

### 8.5.3 Building Effective Dashboards
- Dashboard design principles
- Choosing the right chart types for different data
- Executive dashboards vs. operational dashboards
- KPI selection and hierarchy
- Storytelling with data
- Common dashboard mistakes to avoid
- Dashboard maintenance and evolution

### 8.5.4 Marketing Reporting Framework
- Daily monitoring reports
- Weekly performance reports
- Monthly strategic reports
- Quarterly business reviews (QBRs)
- Annual marketing reports
- Campaign-specific reports
- Reporting to different stakeholders (C-suite, marketing team, clients)
- Actionable recommendations in reports

---

## 8.6 Advanced Analytics & Data Science

### 8.6.1 Customer Lifetime Value (CLV) Analysis
- What is CLV and why it matters
- CLV calculation methods: historical, predictive, traditional
- CLV by acquisition channel
- CLV-based marketing budget allocation
- Improving CLV: retention, upsell, cross-sell strategies
- CLV to CAC ratio as a health metric

### 8.6.2 Cohort & Retention Analysis
- Building cohort reports in GA4
- Retention curves and benchmarks
- Identifying retention drivers
- Week-over-week and month-over-month analysis
- Stickiness metrics: DAU/MAU ratio
- Churn prediction and prevention

### 8.6.3 Predictive Analytics for Marketing
- What is predictive analytics
- Predictive models: propensity scoring, churn prediction, LTV prediction
- GA4 predictive metrics and audiences
- Machine learning in marketing analytics
- Practical applications: lead scoring, product recommendations, dynamic pricing
- Tools and platforms for predictive marketing

### 8.6.4 Privacy-First Analytics
- Impact of cookie deprecation on analytics
- First-party data strategies
- Consent management platforms (CMPs)
- Google Consent Mode
- Server-side tracking
- Privacy Sandbox and Topics API
- Contextual targeting alternatives
- Data clean rooms
- Probabilistic vs. deterministic tracking
- Building a future-proof analytics stack

---

## Module 08 — Hands-On Exercises
1. **GA4 Setup**: Configure a complete GA4 property with events, conversions, and audiences
2. **GTM Implementation**: Set up GTM with GA4, Meta Pixel, and custom event tracking
3. **Dashboard Build**: Create a comprehensive marketing dashboard in Looker Studio
4. **Attribution Analysis**: Compare attribution models and recommend budget reallocation
5. **Funnel Analysis**: Build a conversion funnel in GA4 Explorations and identify drop-off points
6. **Analytics Audit**: Conduct a full audit of an existing analytics setup and document findings

---

## Recommended Tools for This Module
- Google Analytics 4
- Google Tag Manager
- Google Looker Studio
- Google Search Console
- BigQuery (for raw GA4 data)
- Supermetrics (data connections)
- Databox (dashboards)
- CookieBot / OneTrust (consent management)
