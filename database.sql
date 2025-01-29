--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0
-- Dumped by pg_dump version 16.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: annual_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.annual_reports (
    annual_id integer NOT NULL,
    year character varying(4) NOT NULL,
    file_path text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.annual_reports OWNER TO postgres;

--
-- Name: annual_reports_annual_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.annual_reports_annual_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.annual_reports_annual_id_seq OWNER TO postgres;

--
-- Name: annual_reports_annual_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.annual_reports_annual_id_seq OWNED BY public.annual_reports.annual_id;


--
-- Name: campus; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campus (
    campus_id character varying(50) NOT NULL,
    name character varying(50),
    is_extension boolean
);


ALTER TABLE public.campus OWNER TO postgres;

--
-- Name: csd_office; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.csd_office (
    user_id character varying(50) NOT NULL,
    role integer DEFAULT 0,
    name character varying(100),
    email character varying(100),
    password character varying(100),
    CONSTRAINT csd_office_role_check CHECK ((role = ANY (ARRAY[0, 1, 2])))
);


ALTER TABLE public.csd_office OWNER TO postgres;

--
-- Name: evidence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evidence (
    evidence_id character varying(50) NOT NULL,
    name text,
    type character varying(70),
    section_id character varying(50),
    record_id character varying(50)
);


ALTER TABLE public.evidence OWNER TO postgres;
--
-- Name: formula_per_instrument; Type: TABLE; Schema: public; Owner: postgres
--
CREATE TABLE public.formula_per_instrument (
    formula_id character varying(50) NOT NULL,
    formula text,
    instrument_id character varying(50)
);


ALTER TABLE public.formula_per_instrument OWNER TO postgres;

--
-- Name: formula_per_section; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formula_per_section (
    formula_id character varying(50) NOT NULL,
    formula text,
    section_id character varying(50)
);


ALTER TABLE public.formula_per_section OWNER TO postgres;

--
-- Name: instrument; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instrument (
    instrument_id character varying(50) NOT NULL,
    section_no character varying(10),
    sdg_subtitle text,
    sdg_id character varying(50),
    status character varying(10),
    CONSTRAINT instrument_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


ALTER TABLE public.instrument OWNER TO postgres;

--
-- Name: options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.options (
    option_id character varying(50) NOT NULL,
    option text,
    question_id character varying(50)
);


ALTER TABLE public.options OWNER TO postgres;

--
-- Name: question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question (
    question_id character varying(50) NOT NULL,
    question text,
    type character varying(20),
    suffix character varying(20),
    section_id character varying(50),
    sub_id character varying(50)
);


ALTER TABLE public.question OWNER TO postgres;

--
-- Name: records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.records (
    record_id character varying(50) NOT NULL,
    user_id character varying(50),
    status integer DEFAULT 1,
    date_submitted timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sdg_id character varying(50),
    year integer,
    CONSTRAINT records_status_check CHECK ((status = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE public.records OWNER TO postgres;

--
-- Name: records_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.records_values (
    record_value_id character varying(50) NOT NULL,
    value character varying(50),
    question_id character varying(50),
    record_id character varying(50),
    campus_id character varying(255)
);


ALTER TABLE public.records_values OWNER TO postgres;

--
-- Name: sd_office; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sd_office (
    user_id character varying(50) NOT NULL,
    role integer DEFAULT 1,
    name character varying(100),
    email character varying(100),
    password character varying(100),
    campus_id character varying(50),
    CONSTRAINT sd_office_role_check CHECK ((role = ANY (ARRAY[0, 1, 2])))
);


ALTER TABLE public.sd_office OWNER TO postgres;

--
-- Name: sdg; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sdg (
    sdg_id character varying(50) NOT NULL,
    title character varying(50),
    number integer,
    description text
);


ALTER TABLE public.sdg OWNER TO postgres;

--
-- Name: section; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section (
    section_id character varying(50) NOT NULL,
    content_no character varying(10),
    section_content text,
    instrument_id character varying(50)
);


ALTER TABLE public.section OWNER TO postgres;

--
-- Name: annual_reports annual_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annual_reports ALTER COLUMN annual_id SET DEFAULT nextval('public.annual_reports_annual_id_seq'::regclass);


--
-- Data for Name: annual_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.annual_reports (annual_id, year, file_path, created_at) FROM stdin;
1	2001	1730990992324-report card.pdf	2024-11-07 22:49:52.509744
2	2001	1730991693570-Jane Ashley - ID.pdf	2024-11-07 23:01:33.721338
3	2021	1730992063809-Enrollement Form.pdf	2024-11-07 23:07:43.961588
\.


--
-- Data for Name: campus; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campus (campus_id, name, is_extension) FROM stdin;
1	BatStateU - Pablo Borbon Campus	f
2	BatStateU - Alangilan Campus	f
3	BatStateU - Lipa Campus	f
4	BatStateU - Nasugbu Campus	f
10	BatStateU - Malvar Campus	f
5	BatStateU - Lemery Campus	t
6	BatStateU - Rosario Campus	t
7	BatStateU - Balayan Campus	t
8	BatStateU - Mabini Campus	t
9	BatStateU - San Juan Campus	t
11	BatStateU - Lobo Campus	t
\.


--
-- Data for Name: csd_office; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.csd_office (user_id, role, name, email, password) FROM stdin;
001	0	CSD Office	justmyrgutierrez92@gmail.com	$2b$10$u0jAbw5mIuPbLjidsFTSHeqeLQWxHCTxk498C6DnCVeG67hGTXJyO
\.


--
-- Data for Name: evidence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evidence (evidence_id, name, type, section_id, record_id) FROM stdin;
EID585981	1730984652678-Add Promotion.png	image/png	S518615	REC5183389
EID113113	1730984652751-Add Product.png	image/png	S518615	REC5183389
EID235939	1730984652802-Add New Manager.png	image/png	S518615	REC5183389
EID338573	1730984652850-screencapture-localhost-5173-dashboard-2024-11-07-08_59_44 (1).png	image/png	S438839	REC5183389
EID988903	1730984652912-screencapture-localhost-5173-dashboard-2024-11-07-08_59_44.png	image/png	S438839	REC5183389
EID661894	1730984652968-screencapture-localhost-5173-promos-2024-11-07-02_16_39.png	image/png	S438839	REC5183389
EID470781	1730984653017-screencapture-localhost-5173-stores-2024-11-07-02_15_41.png	image/png	S438839	REC5183389
EID175644	1730984653066-screencapture-localhost-5173-orders-2024-11-07-02_15_05.png	image/png	S438839	REC5183389
\.


--
-- Data for Name: formula_per_instrument; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formula_per_instrument (formula_id, formula, instrument_id) FROM stdin;
\.


--
-- Data for Name: formula_per_section; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formula_per_section (formula_id, formula, section_id) FROM stdin;
F249607	=IF((A1*1)+(B1*2)+(C1*3)+(D1*4)>=10,10,(A1*1)+(B1*2)+(C1*3)+(D1*4))	S518615
F793940	=IF(AND(A1>=2,B1>=1),25,IF(AND(A1>0,B1>0),10,IF(AND(A1=1,B1=1),10,IF(AND(A1=1,B1=0),10,IF(AND(A1=0,B1=1),10,IF(AND(A1=0,B1=0),0,IF(AND(A1=0,B1>1),25,IF(AND(A1>1,B1>=0),20))))))))	S438839
\.


--
-- Data for Name: instrument; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instrument (instrument_id, section_no, sdg_subtitle, sdg_id, status) FROM stdin;
I172539		Research on poverty	SDG01	active
I183282		Policy addressing poverty	SDG01	active
\.


--
-- Data for Name: options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.options (option_id, option, question_id) FROM stdin;
\.


--
-- Data for Name: question; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question (question_id, question, type, suffix, section_id, sub_id) FROM stdin;
Q496696	Local	Number		S518615	A1
Q217589	Regional	Number		S518615	B1
Q560144	Global	Number		S518615	D1
Q108117	National	Number		S518615	C1
Q506208	Published Research on Poverty	Number		S438839	A1
Q832712	Co-Authored with Low or Lower-Middle income country	Number		S438839	B1
\.


--
-- Data for Name: records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.records (record_id, user_id, status, date_submitted, sdg_id, year) FROM stdin;
REC5183389	SD52421917	1	2024-11-07 21:04:12.601179	SDG01	2024
\.


--
-- Data for Name: records_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.records_values (record_value_id, value, question_id, record_id, campus_id) FROM stdin;
35222d57-5803-43f5-80e9-c3554fcd80a0	0	Q496696	REC5183389	8
5dd4e001-fb1b-47c4-b418-7b9c0b515fda	0	Q496696	REC5183389	11
a17633b9-a579-4107-8cc7-03812d3c4e54	0	Q496696	REC5183389	2
fec340ec-7f48-4b7c-93d9-6193238e8872	0	Q217589	REC5183389	7
0395b776-27f5-4189-98b2-4b1706c9f74a	3	Q217589	REC5183389	2
3c4e8552-7568-4458-8fca-839a0ea92448	0	Q560144	REC5183389	8
5df9a670-e942-48f1-9f18-b3af1d373d17	0	Q560144	REC5183389	11
7e37437e-287f-4634-a3ff-8f31dfaf6563	0	Q560144	REC5183389	7
5adc0f21-a37d-4f00-ba6d-6d2aa30b8f67	2	Q560144	REC5183389	2
12db9bf7-efa2-472d-ba31-4f2cedea4a41	0	Q108117	REC5183389	8
6c6e5a75-6452-4d89-8b13-4e608d0e296d	0	Q108117	REC5183389	11
7a0a91a1-7a6d-4bae-adeb-8168841cf91f	0	Q108117	REC5183389	7
8076f5fb-e9bb-4de3-9425-0d8e6535ad44	0	Q108117	REC5183389	2
deaadcf2-9bb2-43cf-91ee-05263bfa6e7c	0	Q506208	REC5183389	8
23235f7e-7776-4d5f-8e3d-dada54a7519d	0	Q506208	REC5183389	11
55dee06d-2417-456d-abdd-f5b63c7f252c	0	Q506208	REC5183389	7
ac0b6e7e-3f32-4948-a6f5-2cd54fe667d4	2	Q506208	REC5183389	2
7e219394-3872-48f4-a8e9-7d3246efd179	0	Q832712	REC5183389	8
4e291b77-23ca-4bfa-bec3-78ac8cce3ba5	0	Q832712	REC5183389	11
bc0fb71c-000f-435e-b3fd-b4d1e4d29fb3	0	Q832712	REC5183389	7
c04e08db-50bc-4cf7-8eb2-e259aed5fb43	1	Q832712	REC5183389	2
45ce268f-ff45-464a-a604-66483117a211	0	Q496696	REC5183389	7
827a7577-7650-4400-8d3a-7a3623a91cc5	0	Q217589	REC5183389	8
962eea56-9dd3-4640-a48d-bc94cb0731fd	0	Q217589	REC5183389	11
\.


--
-- Data for Name: sd_office; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sd_office (user_id, role, name, email, password, campus_id) FROM stdin;
SD52421917	1	Justmyr Dimasacat Gutierrez	justmyrd.gutierrez@gmail.com	$2b$10$PhZ/8wgB2zurxJuouRFvwu5g4GgU4OE7r3o6P4EQ/p47q28YgwAYq	2
SD21072691	1	asdasd	justmyrgutierrez1@gmail.com	$2b$10$wozbUtM/btey9Vm1Rawhq.E9u57jEoVQc0sY3po9qZvd8AbVr2cN2	1
SD95615009	1	asdasd	justmyrgutierrez921@gmail.com	$2b$10$Ocm8BGzJdUs3PXdGekDc6.YZrQCdtlXbIaybFgGnxw/STFQTn/IrK	2
\.


--
-- Data for Name: sdg; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sdg (sdg_id, title, number, description) FROM stdin;
SDG01	No Poverty	1	\N
SDG02	Zero Hunger	2	\N
SDG03	Good Health and Well-being	3	\N
SDG04	Quality Education	4	\N
SDG05	Gender Equality	5	\N
SDG06	Clean Water and Sanitation	6	\N
SDG07	Affordable and Clean Energy	7	\N
SDG08	Decent Work and Economic Growth	8	\N
SDG09	Industry, Innovation, and Infrastructure	9	\N
SDG10	Reduced Inequality	10	\N
SDG11	Sustainable Cities and Communities	11	\N
SDG12	Responsible Consumption and Production	12	\N
SDG13	Climate Action	13	\N
SDG14	Life Below Water	14	\N
SDG15	Life on Land	15	\N
SDG16	Peace, Justice, and Strong Institutions	16	\N
SDG17	Partnerships for the Goals	17	\N
\.


--
-- Data for Name: section; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section (section_id, content_no, section_content, instrument_id) FROM stdin;
S518615		Participation in policy addressing poverty	I183282
S438839		Research on poverty	I172539
\.


--
-- Name: annual_reports_annual_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.annual_reports_annual_id_seq', 3, true);


--
-- Name: annual_reports annual_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annual_reports
    ADD CONSTRAINT annual_reports_pkey PRIMARY KEY (annual_id);


--
-- Name: campus campus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campus
    ADD CONSTRAINT campus_pkey PRIMARY KEY (campus_id);


--
-- Name: csd_office csd_office_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.csd_office
    ADD CONSTRAINT csd_office_pkey PRIMARY KEY (user_id);


--
-- Name: evidence evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidence
    ADD CONSTRAINT evidence_pkey PRIMARY KEY (evidence_id);


--
-- Name: formula_per_instrument formula_per_instrument_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formula_per_instrument
    ADD CONSTRAINT formula_per_instrument_pkey PRIMARY KEY (formula_id);


--
-- Name: formula_per_section formula_per_section_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formula_per_section
    ADD CONSTRAINT formula_per_section_pkey PRIMARY KEY (formula_id);


--
-- Name: instrument instrument_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrument
    ADD CONSTRAINT instrument_pkey PRIMARY KEY (instrument_id);


--
-- Name: options options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.options
    ADD CONSTRAINT options_pkey PRIMARY KEY (option_id);


--
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (question_id);


--
-- Name: records records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.records
    ADD CONSTRAINT records_pkey PRIMARY KEY (record_id);


--
-- Name: records_values records_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.records_values
    ADD CONSTRAINT records_values_pkey PRIMARY KEY (record_value_id);


--
-- Name: sd_office sd_office_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sd_office
    ADD CONSTRAINT sd_office_pkey PRIMARY KEY (user_id);


--
-- Name: sdg sdg_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sdg
    ADD CONSTRAINT sdg_pkey PRIMARY KEY (sdg_id);


--
-- Name: section section_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT section_pkey PRIMARY KEY (section_id);


--
-- Name: evidence evidence_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidence
    ADD CONSTRAINT evidence_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.records(record_id);


--
-- Name: evidence evidence_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidence
    ADD CONSTRAINT evidence_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.section(section_id);


--
-- Name: records_values fk_campus; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.records_values
    ADD CONSTRAINT fk_campus FOREIGN KEY (campus_id) REFERENCES public.campus(campus_id);


--
-- Name: records fk_sdg; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.records
    ADD CONSTRAINT fk_sdg FOREIGN KEY (sdg_id) REFERENCES public.sdg(sdg_id);


--
-- Name: formula_per_instrument formula_per_instrument_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formula_per_instrument
    ADD CONSTRAINT formula_per_instrument_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: formula_per_section formula_per_section_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formula_per_section
    ADD CONSTRAINT formula_per_section_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.section(section_id);


--
-- Name: instrument instrument_sdg_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrument
    ADD CONSTRAINT instrument_sdg_id_fkey FOREIGN KEY (sdg_id) REFERENCES public.sdg(sdg_id);


--
-- Name: options options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.options
    ADD CONSTRAINT options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(question_id);


--
-- Name: question question_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.section(section_id);


--
-- Name: records records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.records
    ADD CONSTRAINT records_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.sd_office(user_id);


--
-- Name: records_values records_values_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.records_values
    ADD CONSTRAINT records_values_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(question_id);


--
-- Name: records_values records_values_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.records_values
    ADD CONSTRAINT records_values_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.records(record_id);


--
-- Name: sd_office sd_office_campus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sd_office
    ADD CONSTRAINT sd_office_campus_id_fkey FOREIGN KEY (campus_id) REFERENCES public.campus(campus_id);


--
-- Name: section section_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT section_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- PostgreSQL database dump complete
--

