# RegalosParaTodos.cl — Documento de requisitos

Versión: 0.4 — 24 de octubre de 2026  
Estado: en definición con el cliente; no es una autorización para implementar.  
Cliente y supervisor: Nico.  
Análisis de negocio: este chat. Desarrollo: Claude Code.

## 1. Objetivo

Crear una web moderna para presentar RegalosParaTodos, facilitar la elección de regalos y registrar pedidos. Centralizar su gestión en un panel sencillo, con aprobación manual de transferencias y seguimiento por estados.

La primera versión será atendida manualmente por Nico en WhatsApp. Posteriormente, una agente comercial se conectará al sistema para consultar productos, recomendar y crear o continuar pedidos. La configuración y el desarrollo de esa agente quedan para después de que la web esté lista.

## 2. Forma de trabajo acordada

- Analizar las necesidades y documentar las reglas antes de continuar el desarrollo.
- El cliente compartirá plantillas o referencias para definir el diseño.
- El Business Analyst aclarará procesos, requisitos, propuestas y criterios de aceptación.
- Claude Code implementará lo que se haya definido y aprobado.
- La implementación local existente es preliminar: no representa una aprobación de sus reglas ni de su diseño. El desarrollo está detenido durante esta definición.

## 3. Decisiones confirmadas

| ID | Decisión |
|---|---|
| D01 | La web tendrá catálogo por categorías y fichas individuales de producto orientadas a SEO. |
| D02 | El cliente podrá seleccionar productos y enviar un pedido mediante checkout. |
| D03 | Al confirmar el checkout, el pedido quedará registrado y aparecerá en el sistema interno. Confirmar el checkout no acredita el pago. |
| D04 | El cliente podrá ver los datos bancarios y adjuntar su comprobante desde la web. |
| D05 | También podrá enviar el pedido sin comprobante y continuar el proceso de pago por WhatsApp. |
| D06 | Nico atenderá WhatsApp manualmente durante el lanzamiento y verificará los detalles con el cliente. |
| D07 | Nico verificará los pagos en la cuenta bancaria y cambiará el estado de los pedidos desde el panel. |
| D08 | Adjuntar o recibir un comprobante no equivale a aprobar una transferencia. |
| D09 | Los pedidos tendrán vistas Kanban y lista. Las columnas del Kanban corresponderán a sus estados y permitirán mover tarjetas entre columnas. |
| D10 | El panel permitirá consultar y editar productos, imágenes, descripciones y cantidades disponibles. |
| D11 | La web incluirá hero con video optimizado y texto, productos destacados, cómo funciona, nosotros, contacto con formulario y WhatsApp configurable. |
| D12 | Se priorizarán diseño, velocidad, seguridad y SEO, con contenido accesible para buscadores y sistemas de IA. No se promete posicionamiento. |
| D13 | La entrega de pedidos a Starken será martes y jueves, con horario de corte a las 14:00. Falta definir qué condición debe cumplir un pedido al corte. |
| D14 | El sistema se preparará para la agente comercial, sin construirla ni configurarla en esta etapa. |
| D15 | Durante la definición pueden utilizarse contenidos de demostración; no sustituyen el catálogo, precios ni material definitivo del negocio. |
| D16 | El Kanban tendrá cuatro columnas: Por confirmar, En preparación, Enviado y Finalizado. Pago, avance de preparación y resultado final se mostrarán como indicadores dentro del pedido. |
| D17 | Solo se podrá pasar a preparación después de que el supervisor apruebe la transferencia. Aprobar y pasar a preparación podrá hacerse en una sola acción. |
| D18 | Para pasar a Enviado se registrarán la entrega a Starken y su seguimiento. Para finalizar como entregado se confirmará la recepción. Los cancelados se identificarán como tales en Finalizado. |
| D19 | El pedido puede enviarse directamente a otra persona o al propio comprador para que entregue personalmente el regalo. Los datos de comprador y destinatario deben distinguirse cuando sean diferentes. |
| D20 | La dirección de entrega debe verificarse mostrando Google Maps dentro de un modal para que el cliente compruebe si corresponde a la ubicación indicada. Se descarta la propuesta de «Es una sorpresa» y de no contactar al destinatario. |
| D21 | La aceptación de la ubicación por el cliente es obligatoria para enviar el pedido. Si la ubicación es incorrecta, debe rechazarla, corregir la dirección y verificar nuevamente. No se permite enviar con dirección pendiente de verificar ni sustituir este paso por una ubicación o dirección comunicada manualmente al negocio. |

## 4. Actores y responsabilidades

| Actor | Responsabilidad |
|---|---|
| Cliente comprador | Consultar productos, preparar su pedido, proporcionar datos y gestionar el pago por alguno de los dos canales. |
| Supervisor / administrador | Mantener el catálogo, atender WhatsApp al lanzamiento, verificar transferencias y gestionar pedidos y despachos. |
| Agente comercial futura | Consultar información autorizada del sistema, recomendar productos, verificar detalles con el cliente y crear o continuar pedidos. |

Solo el supervisor aprueba las transferencias. Los permisos concretos de la agente se definirán en su fase; no se presupone acceso irrestricto a la base de datos.

## 5. Recorrido principal del lanzamiento

1. El cliente explora categorías y fichas de productos.
2. Selecciona productos y cantidades.
3. Completa el checkout e indica si recibirá él mismo el pedido u otra persona. Los campos exactos están pendientes de definición.
   - Verifica la dirección de entrega en un modal con Google Maps y confirma o corrige la ubicación antes de enviar el pedido.
4. Puede consultar los datos bancarios y adjuntar un comprobante, o continuar sin él.
5. Al enviar el pedido, el sistema lo registra y lo muestra en el panel del supervisor.
6. Nico continúa la atención manualmente por WhatsApp, verifica los detalles y coordina lo que falte del pago o despacho.
7. Nico comprueba el abono en la cuenta bancaria y registra su aprobación en el sistema.
8. Gestiona la preparación y el avance del pedido mediante sus estados.
9. Coordina el despacho por Starken y el cierre del pedido.

El pedido enviado por la web y el atendido por WhatsApp deben ser el mismo registro. La continuación de la conversación no debe crear otra venta por defecto.

## 6. Funcionalidades de la web

| ID | Funcionalidad | Alcance confirmado / definición pendiente |
|---|---|---|
| WEB01 | Inicio y hero | Video ligero con texto. Composición, mensaje y material pendientes de las referencias visuales. |
| WEB02 | Destacados | Productos con imágenes grandes y descripciones. Selección y cantidad pendientes. |
| WEB03 | Cómo funciona | Explicar pedido web, atención por WhatsApp, transferencia, revisión y despacho. |
| WEB04 | Nosotros | Presentar el emprendimiento. Historia y textos por definir con Nico. |
| WEB05 | Contacto | Formulario de contacto. Campos, destino y atención de los mensajes por definir. |
| WEB06 | WhatsApp | Número configurable. Definir dónde aparece y qué mensaje inicia cada acceso. |
| WEB07 | Catálogo | Productos organizados por categorías. Categorías, filtros y orden por definir. |
| WEB08 | Ficha individual | URL propia, información del regalo y posibilidad de seleccionarlo. Campos definitivos por definir. |
| WEB09 | Selección de productos | Productos y cantidades antes de enviar el pedido. Reglas de stock pendientes. |
| WEB10 | Checkout | Registrar el pedido con o sin comprobante; permitir el pago por transferencia desde la web. |
| WEB11 | Confirmación del registro | Informar que la solicitud fue recibida y que el pago está sujeto a revisión. Se propone mostrar una referencia única. |
| WEB12 | Ingreso administrativo | Acceso del supervisor al panel. Método de autenticación por definir técnicamente. |
| WEB13 | Destinatario | Admitir al comprador o a una tercera persona como receptor del pedido, sin confundir sus datos con los del comprador. |
| WEB14 | Verificación obligatoria de dirección en mapa | Mostrar dirección y ubicación en Google Maps dentro de un modal; exigir aceptación expresa del cliente antes de enviar el pedido. Al rechazar, volver a corregir y verificar. Sin alternativa de envío con ubicación no aceptada. Ver detalle en sección 9.1. |

## 7. Funcionalidades del panel interno

| ID | Funcionalidad | Definición |
|---|---|---|
| ADM01 | Productos | Ver y editar productos, sus imágenes, descripciones y stock. Creación, ocultamiento y eliminación pendientes de confirmar. |
| ADM02 | Listado de pedidos | Ver pedidos y sus estados, con acceso a los datos del checkout y al comprobante cuando exista. |
| ADM03 | Kanban por estado | Cuatro columnas según la sección 8. El supervisor puede arrastrar tarjetas; si el movimiento requiere validación o información, el sistema la solicita antes de guardar. |
| ADM04 | Vista de lista | Mostrar los mismos pedidos y estados en formato de lista. Columnas, búsqueda y filtros pendientes. |
| ADM05 | Detalle del pedido | Consultar selección del cliente, información de contacto, datos de entrega y comprobantes disponibles. |
| ADM06 | Verificación de pago | Registrar manualmente la aprobación después de comprobar el abono en el banco. |
| ADM07 | Operación manual de WhatsApp | Permitir continuar el pedido existente y registrar la información recibida fuera de la web. Forma exacta de edición y adjunto de comprobantes pendiente. |

Se propone historial de cambios de estado, responsable y fecha para facilitar supervisión y evitar confusiones. Pendiente de aprobación.

## 8. Flujo de pedidos aprobado

Flujo principal: **Por confirmar → En preparación → Enviado → Finalizado**.

| Columna | Qué ocurre aquí | Control para avanzar |
|---|---|---|
| Por confirmar | Se recibe el pedido, se verifican sus detalles por WhatsApp y se coordina el pago. | Solo puede pasar a preparación cuando el supervisor aprueba la transferencia. |
| En preparación | Se prepara el regalo y se marca como listo para despacho. | Para pasarlo a Enviado se registran la entrega a Starken y su seguimiento. |
| Enviado | El pedido está en transporte. | Pasa a Finalizado como entregado cuando se confirma la recepción. |
| Finalizado | El pedido fue entregado o cancelado y queda disponible para consulta. | El resultado se identifica expresamente como Entregado o Cancelado. |

Indicadores internos aprobados, sin columnas adicionales:
- **Pago:** pendiente, por revisar o aprobado.
- **Preparación:** preparando o listo para despacho.
- **Resultado final:** entregado o cancelado.

Reglas aprobadas:
- Un pedido recién creado queda en Por confirmar. Si incluye comprobante, muestra Pago por revisar; adjuntarlo no aprueba el pago.
- El supervisor puede aprobar la transferencia y pasar el pedido a En preparación en una sola acción.
- Arrastrar una tarjeta no puede omitir los controles. Si falta una validación o información exigida, se solicita antes de guardar el movimiento.
- Los indicadores y las columnas representan aspectos distintos del pedido; no deben confundirse ni producir estados contradictorios.
- Los pedidos finalizados siguen disponibles para consulta, con resultado visible.

Pendientes: transiciones de retroceso, saltos de columnas, correcciones, quién confirma la recepción y cómo, y desde qué etapas se permite cancelar. Mostrar Cancelado en Finalizado no define todavía las reglas de cancelación ni de devolución.

## 9. Pagos por ambos canales

- **Desde la web:** datos bancarios visibles y comprobante opcional al crear el pedido.
- **Desde WhatsApp al lanzamiento:** Nico entrega o confirma los datos bancarios y recibe el comprobante manualmente.
- **Desde WhatsApp en la fase futura:** la agente podrá asistir ese proceso y asociar la información al pedido, según permisos y reglas que se definan.
- **En todos los casos:** Nico verifica la cuenta bancaria y aprueba el pago.

Pendientes: formatos y tamaño de archivos, cantidad de comprobantes por pedido, forma de añadirlos después del checkout, pagos parciales, diferencias de monto, rechazo, cancelaciones y devoluciones.

### 9.1. Destinatario y verificación de dirección

Requisitos confirmados:
- La entrega puede ser al comprador o directamente a otra persona.
- El cliente debe poder verificar visualmente la dirección en un modal con Google Maps y comprobar que corresponde al destino deseado.
- El cliente debe aceptar o rechazar expresamente la ubicación mostrada con respecto al envío. Solo la aceptación permite enviar el pedido.
- Si no corresponde, el cliente debe corregir la dirección y verificar la nueva ubicación; el negocio no recibe el pedido como «Dirección por verificar».
- Comunicar manualmente una dirección o compartir una ubicación al negocio no sustituye la aceptación del modal.
- No se incluye la opción propuesta de «Es una sorpresa» ni un compromiso de evitar el contacto con el destinatario.

Flujo funcional para el checkout:
1. El cliente ingresa la dirección y los datos necesarios de entrega.
2. El sistema muestra un modal con el texto de la dirección y su ubicación en Google Maps.
3. El cliente elige «Aceptar ubicación» o «Rechazar y corregir dirección». Cerrar el modal no equivale a aceptar.
4. Si rechaza, vuelve al formulario, corrige la dirección y repite la verificación. No puede enviar el pedido mientras la nueva ubicación no esté aceptada.
5. Si modifica la dirección después de aceptarla, esa aceptación queda invalidada y debe verificar y aceptar nuevamente la nueva ubicación.
6. Solo se permite enviar el pedido cuando la dirección actual tiene una ubicación mostrada y aceptada expresamente por el cliente. Si no se encuentra una ubicación o el mapa no se puede mostrar, no se puede completar este paso ni enviar el pedido. Se puede ofrecer reintentar, sin omitir la verificación.
7. La aceptación debe conservarse asociada a la dirección y ubicación del pedido para que el supervisor pueda consultarla.

Confirmar un mapa reduce errores, pero no garantiza que una dirección sea correcta, que exista cobertura de transporte o que se concrete la entrega. No se debe presentar al cliente como una garantía del transportista ni como una exención de responsabilidad.

Pendientes de definición: mensajes y recuperación cuando el mapa no encuentra la dirección o no puede mostrarse; datos complementarios como departamento, casa o referencias; y adaptación de esta verificación si se ofrece retiro en sucursal. Estos detalles no pueden introducir una vía alternativa para enviar un pedido sin ubicación aceptada.

Antecedente por verificar: Nico recuerda una implementación anterior posiblemente realizada con Google Cloud. No se ha identificado esa integración en los archivos locales revisados (src, configuración de ejemplo y dependencias). No se ha revisado una cuenta de Google Cloud ni se presupone que exista un servicio habilitado. Claude Code deberá revisar el proyecto anterior o la configuración disponible antes de decidir si se reutiliza o se implementa una nueva integración. No solicitar claves secretas en el chat.

## 10. Despacho y disponibilidad — decisiones pendientes

Confirmado: Starken, martes y jueves, corte a las 14:00.

Falta definir:
- Qué debe estar cumplido antes del corte: pedido recibido, pago aprobado o pedido preparado.
- Tiempo de preparación y si depende del producto.
- Qué sucede exactamente a las 14:00 y después del corte.
- Cobertura, costo y modalidad de cobro del transporte.
- Dirección a domicilio o retiro en sucursal, y datos necesarios.
- Días sin despacho, feriados y cambios excepcionales.
- Cómo informar una estimación al cliente y cuándo confirmarla.
- Cómo se confirma la entrega al destinatario.
- Cuándo se descuenta o reserva stock y qué ocurre si dos clientes solicitan la última unidad.
- Si un pedido sin pagar vence y cómo se libera su stock.

No se ha aprobado una reserva de stock de 48 horas, preparación de dos días ni envío por pagar. Esas decisiones de la implementación preliminar deben revisarse.

## 11. Diseño y calidad

El diseño definitivo se elaborará a partir de las plantillas que comparta el cliente. No hay una plantilla ni dirección visual aprobada todavía.

Para cada referencia se documentarán: elementos que interesan, elementos que se descartan, adaptación a dispositivos móviles, navegación, jerarquía del catálogo, ficha y checkout. No se presupone autorización para reutilizar archivos, fotografías o código de terceros.

Propuestas de calidad por convertir en criterios verificables:
- Hero con imagen inicial y video optimizado que no retrase la interacción; alternativa cuando el video no pueda reproducirse y respeto de movimiento reducido.
- Diseño adaptable a móvil y escritorio, controles legibles, formularios comprensibles y navegación accesible.
- Fichas con contenido renderizado, títulos, descripciones, enlaces, datos estructurados pertinentes y mapa del sitio. Mantener administración, datos de clientes y pedidos fuera de la indexación.
- Acceso administrativo autenticado; autorización en servidor; comprobantes privados y validación de archivos y formularios.
- Precios, stock y totales comprobados por el sistema, sin confiar únicamente en los valores enviados por el navegador.
- Evitar duplicar pedidos al hacer doble clic o reintentar un envío.

## 12. Agente comercial — fase posterior

Registrar como necesidades futuras, sin implementarlas ahora:
- Consultar productos, descripciones, precios y disponibilidad vigentes.
- Ofrecer y recomendar regalos.
- Recibir aviso de pedidos creados en la web.
- Recuperar el pedido existente y contactar al cliente para verificarlo.
- Crear pedidos originados en conversaciones de WhatsApp.
- Entregar datos de transferencia y asociar comprobantes al pedido.
- Coordinar la atención sin atribuirse la aprobación bancaria del supervisor.
- Posible envío de enlaces de pago en una fase posterior.

La arquitectura debe prever una integración con permisos definidos. Los eventos, contratos de integración, consentimiento de contacto, manejo de fallos y configuración del proveedor de WhatsApp se especificarán cuando corresponda. La recepción de un pedido en la web no implica que ya se haya enviado un WhatsApp.

## 13. Criterios de aceptación iniciales

Derivados de lo confirmado; deberán ampliarse al cerrar las reglas pendientes.

| ID | Resultado esperado |
|---|---|
| CA01 | Al enviar un checkout válido sin comprobante, se registra el pedido y aparece en el panel. |
| CA02 | Al enviar un checkout válido con comprobante, el archivo queda asociado al pedido sin aprobar automáticamente el pago. |
| CA03 | La atención posterior por WhatsApp puede continuar el pedido recibido por la web sin registrar otra venta por defecto. |
| CA04 | El supervisor puede consultar los datos del pedido y el comprobante recibido, cuando exista. |
| CA05 | Kanban y lista muestran la misma información de estado de cada pedido. |
| CA06 | Un movimiento permitido de tarjeta guarda el cambio de estado y se refleja al volver a consultar el pedido. |
| CA07 | La primera versión puede operar sin una agente comercial conectada y sin mostrar que ya se contactó automáticamente al cliente. |
| CA08 | Cada producto publicado tiene una ficha individual accesible desde el catálogo. |
| CA09 | El Kanban presenta exactamente cuatro columnas: Por confirmar, En preparación, Enviado y Finalizado. |
| CA10 | Un pedido con comprobante permanece en Por confirmar y muestra Pago por revisar hasta la aprobación del supervisor. |
| CA11 | No se permite mover un pedido a En preparación sin aprobación del pago; el supervisor puede aprobar y avanzar en una sola acción. |
| CA12 | Para guardar un movimiento a Enviado, se exige registrar la entrega a Starken y su seguimiento. |
| CA13 | Al finalizar como entregado, se exige confirmar la recepción; un pedido cancelado se distingue visualmente de uno entregado en Finalizado. |
| CA14 | La tarjeta puede indicar Listo para despacho dentro de En preparación, sin crear una quinta columna. |
| CA15 | El checkout admite que el receptor sea el comprador u otra persona y conserva diferenciados los datos correspondientes. |
| CA16 | Antes de enviar el pedido, se exige que el cliente compruebe la dirección escrita y su ubicación en un modal con Google Maps, y acepte expresamente que corresponde al destino. |
| CA17 | Cambiar una dirección ya confirmada invalida esa confirmación y exige verificar la nueva ubicación. |
| CA18 | Si el cliente rechaza la ubicación o cierra el modal sin aceptarla, el pedido no se puede enviar. Debe corregir la dirección cuando corresponda y aceptar la ubicación resultante. |
| CA19 | Si no se encuentra una ubicación o el mapa no se muestra, no se registra aceptación ni se permite enviar el pedido. No existe la opción «Dirección por verificar» ni una omisión mediante atención manual por WhatsApp. |
| CA20 | La aceptación consultable por el supervisor corresponde a la misma dirección y ubicación con las que se envió el pedido. |

## 14. Próxima definición con el cliente

Flujo de cuatro columnas aprobado. Las excepciones y correcciones del flujo siguen pendientes.

Siguiente: campos del checkout y del detalle de pedido; atención manual y edición de datos/comprobantes; stock; pagos y excepciones; preparación y despacho; referencias visuales; criterios finales y entrega a Claude Code.

## 15. Registro de acuerdos

| Fecha | Acuerdo |
|---|---|
| 24-10-2026 | El chat asume el rol de Business Analyst; Claude Code será el desarrollador. Se detiene la implementación para definir requisitos y diseño. |
| 24-10-2026 | El checkout registra pedidos que se continúan por WhatsApp y se gestionan en el sistema interno. |
| 24-10-2026 | Se admiten pagos/comprobantes por web o mediante la atención de WhatsApp; la aprobación bancaria corresponde al supervisor. |
| 24-10-2026 | Nico atenderá WhatsApp manualmente al lanzamiento. La configuración de la agente queda para después de que la web esté lista. |
| 24-10-2026 | Se aprueba el Kanban de cuatro columnas y sus indicadores internos: Por confirmar → En preparación → Enviado → Finalizado. Se aprueban los controles de pago, registro de envío y confirmación de recepción descritos en la sección 8. |
| 24-10-2026 | Se confirma la entrega al comprador o a otra persona y la verificación visual de la dirección en un modal con Google Maps. La posible integración previa de Google Cloud queda pendiente de identificar. |
| 24-10-2026 | Se exige aceptación expresa de la ubicación para enviar el pedido. El rechazo obliga a corregir y verificar nuevamente; no se admiten pedidos con dirección por verificar ni sustitución por una ubicación comunicada manualmente al negocio. |
